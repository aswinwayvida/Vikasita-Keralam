# Move Vikasita Keralam Project to GitHub

## Goal
Connect the Lovable project to GitHub via Lovable's built-in Git sync, creating a new GitHub repository that stays in two-way sync with the Lovable editor.

## Prerequisites
- A GitHub account (personal or organization) where you are an owner/admin.
- Workspace owner or admin role in Lovable to authorize the GitHub App.

## Steps

1. Open the Lovable editor for this project.
2. Open the **Plus (+) menu** in the chat input (bottom-left).
3. Select **GitHub → Connect project**.
4. Authorize the Lovable GitHub App when prompted.
5. Choose the GitHub account or organization where the repository should live.
6. Click **Create Repository** in Lovable.
7. Wait for the initial sync to complete. Lovable will push the current codebase to the new private repository.

## After Connection
- The repository will be private by default under the selected account/organization.
- Any future changes made in Lovable will automatically push to GitHub.
- You can clone the repository locally, push commits from your IDE, and those commits will sync back into Lovable.
- Do not rename, move, or delete the connected GitHub repository, as this will break the sync.

## Optional Next Steps
- Clone the repo locally: `git clone <repository-url>`
- Invite collaborators on GitHub for pull-request based workflows.
- Enable GitHub Branch Switching in Lovable Account Settings → Labs if you want branch management inside Lovable.

## Notes
- This creates a **new** repository. Lovable cannot import an existing GitHub repository into this project.
- Database data is not included in the Git sync; export that separately from Cloud → Advanced settings if needed.
- This is a UI-driven action inside Lovable; the agent cannot trigger the OAuth/GitHub App authorization on your behalf.
