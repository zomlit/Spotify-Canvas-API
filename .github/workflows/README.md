# GitHub Actions Workflows

## Daily Repository Sync

The `sync-fork.yml` workflow automatically syncs the Spotify-Canvas-API repository daily at midnight UTC. This ensures the repository stays up to date with any changes.

### Setup Instructions

1. **Enable GitHub Actions**:
   - Go to your repository settings
   - Navigate to "Actions" → "General"
   - Ensure "Allow all actions and reusable workflows" is selected

2. **Set up repository permissions**:
   - Go to your repository settings
   - Navigate to "Actions" → "General"
   - Under "Workflow permissions", select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"

### How it works

- **Schedule**: Runs daily at midnight UTC (`0 0 * * *`)
- **Manual trigger**: Can also be triggered manually via the "Actions" tab
- **Simple sync**: Pulls the latest changes from the main branch
- **Status reporting**: Shows current branch and latest commit information

### What it does

1. **Checks out the repository** with full history
2. **Configures Git** with the GitHub Actions bot identity
3. **Shows current status** including branch and latest commit
4. **Pulls latest changes** from the main branch

### Manual Sync

You can manually trigger the sync by:
1. Going to the "Actions" tab in your repository
2. Selecting "Daily Repository Sync"
3. Clicking "Run workflow"

### Customization

- **Change schedule**: Modify the `cron` expression in the workflow file
- **Add notifications**: Add notification steps using GitHub's notification actions
- **Branch protection**: Ensure your main branch allows the workflow to pull changes