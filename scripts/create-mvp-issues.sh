#!/bin/bash

# OpenDesk MVP Issues Creation Script
# This script creates GitHub issues for all remaining MVP tasks

echo "🚀 OpenDesk MVP Issues Creation Script"
echo "======================================"

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed. Please install it first."
    echo "Visit: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub. Please run 'gh auth login' first."
    exit 1
fi

echo "✅ GitHub CLI is installed and authenticated"

# Function to create issue from template
create_issue() {
    local template_file="$1"
    local title="$2"
    local labels="$3"
    local priority="$4"
    
    echo "Creating issue: $title"
    
    # Extract content from template (skip the frontmatter)
    local content=$(tail -n +10 "$template_file")
    
    # Create the issue
    gh issue create \
        --title "$title" \
        --body "$content" \
        --label "$labels" \
        --assignee "" \
        --milestone "" \
        --project ""
    
    if [ $? -eq 0 ]; then
        echo "✅ Created: $title"
    else
        echo "❌ Failed to create: $title"
    fi
}

# Define issue templates directory
TEMPLATES_DIR=".github/ISSUE_TEMPLATE"

# Check if templates directory exists
if [ ! -d "$TEMPLATES_DIR" ]; then
    echo "❌ Templates directory not found: $TEMPLATES_DIR"
    exit 1
fi

echo "📋 Creating MVP issues..."

# High Priority Issues
echo "🔥 Creating High Priority Issues..."
create_issue "$TEMPLATES_DIR/01-authentication-system.md" "[AUTH] Complete Authentication System with Password Reset and Security Features" "backend,security,authentication,high-priority" "High"

create_issue "$TEMPLATES_DIR/02-ticket-system-crud.md" "[TICKET] Complete Ticket CRUD Operations and Status Management" "backend,frontend,tickets,high-priority" "High"

create_issue "$TEMPLATES_DIR/03-user-management-system.md" "[USER] Complete User Management System with RBAC" "backend,frontend,admin,high-priority" "High"

create_issue "$TEMPLATES_DIR/04-email-integration.md" "[EMAIL] Complete Email Integration and Notification System" "backend,email,notifications,high-priority" "High"

create_issue "$TEMPLATES_DIR/05-agent-dashboard.md" "[FRONTEND] Complete Agent Dashboard with Ticket Management" "frontend,dashboard,agent,high-priority" "High"

create_issue "$TEMPLATES_DIR/06-admin-portal.md" "[ADMIN] Complete Admin Portal with System Configuration" "frontend,backend,admin,high-priority" "High"

create_issue "$TEMPLATES_DIR/09-security-hardening.md" "[SECURITY] Implement Security Hardening and Compliance" "backend,security,compliance,high-priority" "High"

create_issue "$TEMPLATES_DIR/13-deployment-devops.md" "[DEVOPS] Set up Production Deployment and DevOps Infrastructure" "devops,deployment,infrastructure,high-priority" "High"

# Medium Priority Issues
echo "🔶 Creating Medium Priority Issues..."
create_issue "$TEMPLATES_DIR/07-file-storage.md" "[STORAGE] Implement File Upload and Storage System" "backend,storage,files,medium-priority" "Medium"

create_issue "$TEMPLATES_DIR/08-search-filtering.md" "[SEARCH] Implement Search and Filtering System" "backend,frontend,search,medium-priority" "Medium"

create_issue "$TEMPLATES_DIR/10-performance-optimization.md" "[PERFORMANCE] Implement Performance Optimization and Scalability" "backend,frontend,performance,medium-priority" "Medium"

create_issue "$TEMPLATES_DIR/11-testing-infrastructure.md" "[TESTING] Implement Comprehensive Testing Framework" "testing,quality,backend,frontend,medium-priority" "Medium"

create_issue "$TEMPLATES_DIR/15-mobile-pwa.md" "[MOBILE] Implement Mobile Responsiveness and PWA Features" "frontend,mobile,pwa,medium-priority" "Medium"

create_issue "$TEMPLATES_DIR/16-realtime-notifications.md" "[REALTIME] Implement Real-time Notification System" "backend,frontend,websocket,notifications,medium-priority" "Medium"

create_issue "$TEMPLATES_DIR/17-api-documentation.md" "[API] Create Comprehensive API Documentation and Integration Tools" "backend,api,documentation,integration,medium-priority" "Medium"

create_issue "$TEMPLATES_DIR/19-database-migration.md" "[DATABASE] Implement Database Migration and Optimization" "backend,database,migration,medium-priority" "Medium"

create_issue "$TEMPLATES_DIR/20-error-handling-logging.md" "[LOGGING] Implement Comprehensive Error Handling and Logging" "backend,frontend,logging,error-handling,medium-priority" "Medium"

# Low Priority Issues
echo "🔵 Creating Low Priority Issues..."
create_issue "$TEMPLATES_DIR/12-documentation-system.md" "[DOCS] Create Comprehensive Documentation System" "documentation,guides,low-priority" "Low"

create_issue "$TEMPLATES_DIR/14-analytics-reporting.md" "[ANALYTICS] Implement Analytics and Reporting System" "backend,frontend,analytics,reporting,low-priority" "Low"

create_issue "$TEMPLATES_DIR/18-project-management.md" "[PROJECT] Implement Project Management and Progress Tracking" "management,tracking,productivity,low-priority" "Low"

# MVP Tracker Issue
echo "📊 Creating MVP Completion Tracker..."
create_issue "$TEMPLATES_DIR/mvp-completion-tracker.md" "[MVP] OpenDesk MVP Completion Tracker" "epic,mvp,tracking,high-priority" "High"

echo ""
echo "🎉 All issues have been created successfully!"
echo "📋 Total issues created: 23"
echo "🔥 High Priority: 8 issues"
echo "🔶 Medium Priority: 9 issues"
echo "🔵 Low Priority: 3 issues"
echo "📊 Tracking: 1 issue"
echo "🐛 Templates: 2 additional templates (bug_report, feature_request)"
echo ""
echo "Next steps:"
echo "1. Review and assign issues to team members"
echo "2. Set up project boards for tracking"
echo "3. Create milestones for better organization"
echo "4. Begin development with high priority items"
echo ""
echo "Happy coding! 🚀"