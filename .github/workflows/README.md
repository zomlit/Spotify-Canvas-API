# GitHub Actions Workflows

## Sync Fork Workflow

The `sync-fork.yml` workflow automatically syncs your forked repository with the upstream repository daily at midnight UTC.

### Setup Instructions

1. **Configure the upstream repository**: 
   - Open `.github/workflows/sync-fork.yml`
   - Replace `ORIGINAL_OWNER` with the actual upstream repository owner
   - For example, if you forked from `microsoft/vscode`, replace `ORIGINAL_OWNER` with `microsoft`

2. **Enable GitHub Actions**:
   - Go to your repository settings
   - Navigate to "Actions" → "General"
   - Ensure "Allow all actions and reusable workflows" is selected

3. **Set up repository permissions**:
   - Go to your repository settings
   - Navigate to "Actions" → "General"
   - Under "Workflow permissions", select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"

### How it works

- **Schedule**: Runs daily at midnight UTC (`0 0 * * *`)
- **Manual trigger**: Can also be triggered manually via the "Actions" tab
- **Smart sync**: Only syncs if there are actual changes in the upstream repository
- **Conflict resolution**: Attempts to merge changes, and if conflicts occur, tries a rebase approach
- **Safety**: Uses `--force-with-lease` to prevent overwriting others' work

### Troubleshooting

1. **Permission errors**: Ensure the workflow has write permissions to the repository
2. **Merge conflicts**: The workflow will fail if it cannot automatically resolve conflicts
3. **Upstream not found**: Double-check that you've correctly replaced `ORIGINAL_OWNER` with the actual upstream repository owner

### Manual Sync

You can manually trigger the sync by:
1. Going to the "Actions" tab in your repository
2. Selecting "Sync Fork with Upstream"
3. Clicking "Run workflow"

### Customization

- **Change schedule**: Modify the `cron` expression in the workflow file
- **Add notifications**: Add notification steps using GitHub's notification actions
- **Branch protection**: Ensure your main branch allows the workflow to push changes