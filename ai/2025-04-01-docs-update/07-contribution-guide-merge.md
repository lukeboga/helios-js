# Draft: Merging Contribution Guides

This document outlines the approach for merging the two existing contribution guides:
1. `/docs/contribution-guide.md` - Which focuses specifically on adding pattern handlers
2. `/docs/development/contributing-guide.md` - Which provides general contribution guidelines

## Approach

We will create a unified contribution guide that:
1. Maintains all the valuable information from both guides
2. Eliminates duplication
3. Creates a logical flow from general contribution guidelines to specific pattern handler instructions
4. Updates any outdated information to align with the modernization plan

## Combined Structure

The merged guide will follow this structure:

```
# Contributing to Helios-JS

1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Project Structure](#project-structure)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Documentation](#documentation)
7. [Contribution Workflow](#contribution-workflow)
8. [Pull Request Guidelines](#pull-request-guidelines)
9. [Community and Communication](#community-and-communication)
10. [Pattern Handler Development](#pattern-handler-development)
    - [Handler Structure](#handler-structure)
    - [Creating a New Pattern Handler](#creating-a-new-pattern-handler)
    - [Best Practices](#best-practices)
    - [Example: Month Day Pattern Handler](#example-month-day-pattern-handler)
```

This structure incorporates all content from the general contribution guide, with the pattern handler-specific content added as a detailed section at the end.

## Content Analysis

### Unique content in `/docs/contribution-guide.md`:
- Detailed guide for adding pattern handlers
- Handler structure explanation
- Step-by-step process for creating handlers
- Best practices for pattern recognition
- Example of a month day pattern handler

### Unique content in `/docs/development/contributing-guide.md`:
- General project contribution guidelines
- Development environment setup
- Project structure overview
- Coding standards
- General testing information
- Documentation guidelines
- Contribution workflow
- Pull request guidelines
- Community guidelines

### Overlapping content:
- Brief testing information (though the detailed guide is referenced in both)

## Implementation Plan

1. Use the general contribution guide (`contributing-guide.md`) as the base
2. Add the pattern handler content from `contribution-guide.md` as a new section
3. Update any outdated references to align with:
   - Current folder structure
   - Current API
   - Modernization plan for pattern handlers
4. Add a change log at the top of the merged document
5. Place the final document at `/docs/development/contributing-guide.md`
6. Delete the original file at `/docs/contribution-guide.md` as we do not need backward compatibility
7. Update all references to the old guide in other documentation files

## Draft of the Merged Document

The complete draft with all merged content follows in the final implementation document.

## Next Steps

Once this draft is approved, we will:
1. Create the actual merged document at `/docs/development/contributing-guide.md`
2. Delete the original file at `/docs/contribution-guide.md`
3. Update the progress tracking table in the implementation approach document 