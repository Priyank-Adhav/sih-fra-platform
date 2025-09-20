# Feature Guide: Document Management

**Branch Name:** `feature/doc-management`

**Purpose:**
Build the backend for document upload, OCR processing, and mock legal bundle generation. The dashboard frontend will later integrate with this API; this branch focuses solely on backend functionality.

---

## Deliverables

### 1. Backend

* FastAPI project structure with endpoints:

  * `POST /api/docs/upload`: accepts file upload (PDF, image).
  * `GET /api/docs/{id}`: retrieves document and OCR output.
  * `POST /api/docs/{id}/bundle`: generates mock legal bundle (PDF + QR code linking to document hash).
* Implement Tesseract OCR (or mock extraction) for MVP.
* Store minimal metadata: filename, upload date, user, hash, OCR text.
* Unit tests for all endpoints.

### 2. API Contract

* Create `docs/api-contracts/docs.json` defining:

  * Endpoint paths, HTTP methods, request parameters, and response schema.
  * Example response for `GET /api/docs/{id}`:

```json
{
  "id": "doc-123",
  "filename": "patta_scan.pdf",
  "upload_date": "2025-09-20T12:00:00Z",
  "ocr_text": "Extracted OCR text here...",
  "hash": "abc123..."
}
```

### 3. Independent Assumptions

* OCR can be mocked or partial extraction for MVP.
* Map snapshot in legal bundle can be mocked.
* Dashboard frontend will consume this API separately.
* File storage can be local filesystem for MVP.

### 4. Success Criteria

* Document upload and retrieval works as per API contract.
* OCR output is returned (even if mocked).
* Legal bundle generation endpoint produces downloadable file.
* Backend runs independently and is ready for dashboard integration.
