# AWS Deployment Guide

This guide explains how to deploy the Biobased Beslisboom Webtool to AWS Amplify.

## Prerequisites

1. AWS Account
2. AWS CLI installed (optional, for command line deployment)
3. Git repository (GitHub, GitLab, Bitbucket, or AWS CodeCommit)

## Option 1: Deploy via AWS Amplify Console (Recommended)

### Step 1: Prepare Git Repository

1. Initialize git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Push to a Git hosting service:
   - GitHub
   - GitLab
   - Bitbucket
   - AWS CodeCommit

### Step 2: Create Amplify App

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Connect your Git repository:
   - Choose your Git provider
   - Authorize AWS Amplify to access your repository
   - Select the repository and branch
4. Configure build settings:
   - Amplify will automatically detect the `amplify.yml` file
   - Verify build settings match:
     - Build command: `npm run build`
     - Output directory: `dist`
5. Review and deploy:
   - Review the configuration
   - Click "Save and deploy"

### Step 3: Configure Environment Variables

**Required for Google Analytics:**

1. Go to your Amplify app in the AWS Console
2. Navigate to **App settings** → **Environment variables**
3. Click **Manage variables**
4. Add the following variable:
   - **Key**: `VITE_GA_MEASUREMENT_ID`
   - **Value**: `G-MZZ88M6MGW`
   - **Apply to**: Select all branches/environments where you want analytics active
5. Click **Save**
6. **Important**: After adding the variable, you need to **redeploy** your app:
   - Go to the **Deployments** tab
   - Click **Redeploy this version** (or trigger a new deployment by pushing to your branch)

**Note**: The Measurement ID is also hardcoded as a fallback in the code, so analytics will work even without the environment variable, but it's best practice to use the environment variable for flexibility.

### Step 4: Custom Domain (Optional)

1. Go to App settings → Domain management
2. Add your custom domain
3. Follow the DNS configuration instructions

## Option 2: Deploy via AWS CLI

### Install AWS CLI

```bash
# macOS
brew install awscli

# Or download from: https://aws.amazon.com/cli/
```

### Configure AWS CLI

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter default region (e.g., eu-west-1)
# Enter default output format (json)
```

### Deploy

```bash
# Build the project
npm run build

# Install Amplify CLI (if not installed)
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

## Build Configuration

The `amplify.yml` file configures:
- **Node.js version**: Uses Node 20 (as specified in package.json)
- **Build command**: `npm ci` followed by `npm run build`
- **Output directory**: `dist`
- **Caching**: Node modules are cached for faster builds

## Important Notes

1. **Node.js Version**: The project requires Node.js 20.x (configured in package.json `engines` field)
2. **Static Assets**: The `public/flow.yaml` file will be copied to the dist folder automatically
3. **SPA Routing**: If you plan to add routing later, configure redirects in Amplify console

## Troubleshooting

### Build Fails

1. Check build logs in Amplify Console
2. Verify Node.js version is 20.x
3. Ensure all dependencies are in package.json

### YAML File Not Loading

1. Verify `public/flow.yaml` exists
2. Check that the file is copied to `dist/flow.yaml` after build
3. Review browser console for 404 errors

### Environment-Specific Issues

- Check that `vite.config.ts` is properly configured
- Verify base path settings if deploying to a subdirectory

## Post-Deployment

1. Test the deployed application
2. Set up custom domain (if needed)
3. Configure custom error pages (optional)
4. Set up monitoring and alerts (optional)

## Support

For issues with:
- **AWS Amplify**: Check [AWS Amplify Documentation](https://docs.amplify.aws/)
- **Build errors**: Review build logs in Amplify Console
- **Application errors**: Check browser console and network tab
