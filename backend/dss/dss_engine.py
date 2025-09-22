import json
import os
from typing import List, Dict, Any
from datetime import datetime
from models import VillageData, Recommendation, PriorityLevel

class DSSEngine:
    def __init__(self):
        self.schemes = self._load_schemes()
        self.villages = self._load_villages()
    
    def _load_schemes(self) -> List[Dict[str, Any]]:
        """Load schemes data from JSON file"""
        try:
            with open('data/schemes.json', 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return []
    
    def _load_villages(self) -> Dict[str, VillageData]:
        """Load villages data from JSON file"""
        try:
            with open('data/villages.json', 'r', encoding='utf-8') as f:
                villages_data = json.load(f)
                return {
                    village['village_id']: VillageData(**village) 
                    for village in villages_data
                }
        except FileNotFoundError:
            return {}
    
    def get_available_villages(self) -> List[str]:
        """Get list of available village IDs"""
        return list(self.villages.keys())
    
    def get_available_schemes(self) -> List[Dict[str, str]]:
        """Get list of available schemes with basic info"""
        return [
            {
                "scheme_id": scheme["scheme_id"],
                "name": scheme["name"],
                "category": scheme["category"]
            }
            for scheme in self.schemes
        ]
    
    def get_recommendations(self, village_id: str) -> List[Recommendation]:
        """Get scheme recommendations for a specific village"""
        if village_id not in self.villages:
            raise ValueError(f"Village with ID '{village_id}' not found")
        
        village = self.villages[village_id]
        recommendations = []
        
        for scheme in self.schemes:
            score, reason = self._calculate_scheme_score(scheme, village)
            
            if score > 0:  # Only include schemes with positive scores
                priority = self._determine_priority(score)
                
                recommendation = Recommendation(
                    scheme=scheme["name"],
                    reason=reason,
                    score=score,
                    priority=priority,
                    description=scheme["description"],
                    estimated_cost=scheme.get("estimated_cost_per_household", scheme.get("estimated_cost_per_person", 0)),
                    duration_months=scheme.get("duration_months", 12)
                )
                recommendations.append(recommendation)
        
        # Sort by score (highest first) and return top 10
        recommendations.sort(key=lambda x: x.score, reverse=True)
        return recommendations[:10]
    
    def _calculate_scheme_score(self, scheme: Dict[str, Any], village: VillageData) -> tuple[float, str]:
        """Calculate score and reason for a scheme based on village attributes"""
        score = 0.0
        reasons = []
        
        # Check eligibility criteria
        eligibility_score = self._check_eligibility(scheme, village)
        if eligibility_score == 0:
            return 0.0, "Village does not meet basic eligibility criteria"
        
        # Calculate score based on priority factors
        priority_factors = scheme.get("priority_factors", [])
        
        for factor in priority_factors:
            factor_score, factor_reason = self._calculate_factor_score(factor, scheme, village)
            score += factor_score
            if factor_reason:
                reasons.append(factor_reason)
        
        # Normalize score to 0-1 range
        if priority_factors:
            score = score / len(priority_factors)
        
        # Apply bonus multipliers
        score = self._apply_bonus_multipliers(score, scheme, village)
        
        # Ensure score is between 0 and 1
        score = max(0.0, min(1.0, score))
        
        reason = "; ".join(reasons) if reasons else "General eligibility"
        return score, reason
    
    def _check_eligibility(self, scheme: Dict[str, Any], village: VillageData) -> float:
        """Check if village meets basic eligibility criteria for the scheme"""
        eligibility_criteria = scheme.get("eligibility_criteria", {})
        
        for factor, criteria in eligibility_criteria.items():
            village_value = getattr(village, factor, None)
            if village_value is None:
                continue
                
            min_val = criteria.get("min", 0)
            max_val = criteria.get("max", 1)
            
            if not (min_val <= village_value <= max_val):
                return 0.0
        
        return 1.0
    
    def _calculate_factor_score(self, factor: str, scheme: Dict[str, Any], village: VillageData) -> tuple[float, str]:
        """Calculate score for a specific factor"""
        village_value = getattr(village, factor, None)
        if village_value is None:
            return 0.0, None
        
        # Define factor-specific scoring logic
        if factor == "water_index":
            if village_value <= 0.3:
                return 0.9, f"Very low water index ({village_value:.2f})"
            elif village_value <= 0.5:
                return 0.6, f"Low water index ({village_value:.2f})"
            else:
                return 0.2, f"Moderate water index ({village_value:.2f})"
        
        elif factor == "poverty_index":
            if village_value <= 0.3:
                return 0.9, f"High poverty level ({village_value:.2f})"
            elif village_value <= 0.6:
                return 0.6, f"Moderate poverty level ({village_value:.2f})"
            else:
                return 0.3, f"Lower poverty level ({village_value:.2f})"
        
        elif factor == "literacy_rate":
            if village_value <= 0.4:
                return 0.8, f"Low literacy rate ({village_value:.2f})"
            elif village_value <= 0.7:
                return 0.5, f"Moderate literacy rate ({village_value:.2f})"
            else:
                return 0.2, f"High literacy rate ({village_value:.2f})"
        
        elif factor == "employment_rate":
            if village_value <= 0.4:
                return 0.8, f"Low employment rate ({village_value:.2f})"
            elif village_value <= 0.7:
                return 0.5, f"Moderate employment rate ({village_value:.2f})"
            else:
                return 0.2, f"High employment rate ({village_value:.2f})"
        
        elif factor == "infrastructure_score":
            if village_value <= 0.4:
                return 0.8, f"Poor infrastructure ({village_value:.2f})"
            elif village_value <= 0.7:
                return 0.5, f"Moderate infrastructure ({village_value:.2f})"
            else:
                return 0.2, f"Good infrastructure ({village_value:.2f})"
        
        elif factor == "connectivity_score":
            if village_value <= 0.4:
                return 0.8, f"Poor connectivity ({village_value:.2f})"
            elif village_value <= 0.7:
                return 0.5, f"Moderate connectivity ({village_value:.2f})"
            else:
                return 0.2, f"Good connectivity ({village_value:.2f})"
        
        elif factor == "agricultural_land_percentage":
            if village_value >= 0.6:
                return 0.8, f"High agricultural land ({village_value:.2f})"
            elif village_value >= 0.3:
                return 0.5, f"Moderate agricultural land ({village_value:.2f})"
            else:
                return 0.2, f"Low agricultural land ({village_value:.2f})"
        
        elif factor == "forest_coverage":
            if village_value >= 0.6:
                return 0.8, f"High forest coverage ({village_value:.2f})"
            elif village_value >= 0.3:
                return 0.5, f"Moderate forest coverage ({village_value:.2f})"
            else:
                return 0.2, f"Low forest coverage ({village_value:.2f})"
        
        elif factor == "population":
            if village_value <= 2000:
                return 0.8, f"Small population ({village_value})"
            elif village_value <= 5000:
                return 0.5, f"Medium population ({village_value})"
            else:
                return 0.2, f"Large population ({village_value})"
        
        # Default scoring for unknown factors
        return 0.5, f"Factor {factor} considered"
    
    def _apply_bonus_multipliers(self, score: float, scheme: Dict[str, Any], village: VillageData) -> float:
        """Apply bonus multipliers based on additional factors"""
        multiplier = 1.0
        
        # Population-based bonus
        if village.population >= 3000:
            multiplier += 0.1
        
        # Patta count bonus
        if village.patta_count >= 200:
            multiplier += 0.1
        
        # Health facilities bonus
        if village.health_facilities >= 3:
            multiplier += 0.05
        
        # Education facilities bonus
        if village.education_facilities >= 4:
            multiplier += 0.05
        
        return score * multiplier
    
    def _determine_priority(self, score: float) -> PriorityLevel:
        """Determine priority level based on score"""
        if score >= 0.8:
            return PriorityLevel.HIGH
        elif score >= 0.5:
            return PriorityLevel.MEDIUM
        else:
            return PriorityLevel.LOW
