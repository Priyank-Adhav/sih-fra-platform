# Contributing Guidelines

## 1. General Principles

* **Never commit directly to `main`.**
* **All development happens on branches**, with Pull Requests (PRs) into `develop`.
* **One branch = one logical unit of work** (feature, bug fix, documentation update).
* **All code must be reviewed** before being merged.
* **No secrets, or `.env` files** should ever be committed.
* **Always follow the "One Purpose Per Commit" principle.** Each commit should accomplish **exactly one thing**. Avoid combining unrelated changes into a single commit. Break down your changes into multiple commits if required.

---

## 2. Branching Model

We follow a simplified **Git Flow** model:

* **`main` branch**

  * Always stable, deployable, and demo-ready.
  * Protected: no direct commits or unreviewed merges.
  * Receives merges from `develop` only after successful testing.

* **`develop` branch**

  * Integration branch where all feature and fix branches are merged.
  * Always kept in a buildable, testable state.
  * All PRs should target `develop`, not `main`.

* **Feature branches**

  * Used for new features or improvements.
  * Naming convention:

    ```
    feature/<short-description>
    ```

    Example: `feature/fra-atlas-backend`

* **Fix branches**

  * Used for bug fixes or small corrections.
  * Naming convention:

    ```
    fix/<short-description>
    ```

    Example: `fix/readme-typo`

---

## 3. Workflow

### Step 1: Update `develop`

```bash
git checkout develop
git pull origin develop
```

### Step 2: Create a branch

```bash
# For a feature
git checkout -b feature/<name>

# For a fix
git checkout -b fix/<name>
```

### Step 3: Make changes

* Work locally and commit often.
* Each commit should be **atomic** (do one thing).
* Write descriptive commit messages (see below).

### Step 4: Commit your work

```bash
git add .
git commit -m "Add base map view for FRA Atlas"
```

**Good commit message examples:**

* `Add DSS endpoint for scheme recommendations`
* `Fix login bug in authentication service`
* `Update CONTRIBUTING guidelines`

### Step 5: Push your branch

```bash
git push origin feature/<name>
```

### Step 6: Open a Pull Request

* Go to the repository on GitHub.
* Open a PR from your branch → `develop`.
* Provide:

  * **Clear title** (`Add dashboard shell for frontend`)
  * **Short description** (what the branch does, why, and any notes).

### Step 7: Code Review

* Another teammate must review your PR.
* If changes are requested:

  * Make updates locally.
  * Push commits to the same branch (they appear automatically in the PR).

### Step 8: Merge

* After approval, merge into `develop`.
* Use **Squash and Merge** to keep history clean.
* Never merge your own PR without review.

### Step 9: Cleanup

* Delete the feature/fix branch (GitHub UI provides an option).
* Update your local `develop`:

```bash
git checkout develop
git pull origin develop
```

---

## 4. Handling Small Fixes

Even for small edits (typos, README updates, configuration tweaks), create a branch and submit a PR.

Example:

```bash
git checkout -b fix/readme-typo
# make the change
git commit -m "Fix typo in README"
git push origin fix/readme-typo
```

---
