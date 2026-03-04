Publish a new version of claude-team-tasks-tui. Argument: version bump type (patch, minor, major). Default: patch.

Steps:
1. Read the current version from package.json
2. Bump the version according to the argument ($ARGUMENTS or "patch" if empty)
3. Run `bun run build` to rebuild the dist
4. Stage package.json and dist/ changes
5. Commit with message: "Release vX.Y.Z"
6. Create a git tag `vX.Y.Z` matching the new version
7. Push the commit and tag: `git push && git push --tags`
8. Report the new version and the install command: `bunx github:nthplusio/claude-team-tasks-tui#vX.Y.Z`
