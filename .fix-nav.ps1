# fix-nav.ps1 - Replace all navigation blocks with modern text-only links
# Run this script inside your Front-End directory.

$ErrorActionPreference = "Stop"

# Define the new navigation block (clean, no icons, with proper hrefs)
$newNav = @'
<nav id="main-nav">
    <div class="nav-brand">
        <span class="brand-icon">⚡</span>
        <span class="brand-text">STEM Forge</span>
    </div>
    
    <button class="mobile-menu-toggle" id="mobile-menu-toggle">☰ Menu</button>
    
    <div class="nav-links" id="nav-links">
        <!-- Desktop & mobile visible links (no icons) -->
        <a href="index.html" class="nav-btn hidden lg:block border border-border-subtle text-deep-navy font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-container-highest transition-colors">Dashboard</a>
        <a href="ai-generate.html" class="nav-btn hidden lg:block border border-border-subtle text-deep-navy font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-container-highest transition-colors">AI Generate</a>
        <a href="scheme.html" class="nav-btn hidden lg:block border border-border-subtle text-deep-navy font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-container-highest transition-colors">Scheme</a>
        <a href="attendance.html" class="nav-btn hidden lg:block border border-border-subtle text-deep-navy font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-container-highest transition-colors">Attendance</a>
        <a href="students.html" class="nav-btn hidden lg:block border border-border-subtle text-deep-navy font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-container-highest transition-colors">Students</a>
        <a href="classes.html" class="nav-btn hidden lg:block border border-border-subtle text-deep-navy font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-container-highest transition-colors">Classes</a>
        <a href="attendance-reports.html" class="nav-btn hidden lg:block border border-border-subtle text-deep-navy font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-container-highest transition-colors">Reports</a>
        
        <!-- More dropdown (visible on all screen sizes) -->
        <div class="nav-dropdown hidden lg:block">
            <button class="nav-dropdown-btn border border-border-subtle text-deep-navy font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-container-highest transition-colors">More ▼</button>
            <div class="nav-dropdown-content">
                <a href="pricing.html" class="block px-4 py-2 hover:bg-surface-container-highest transition-colors">Pricing</a>
                <a href="exams.html" class="block px-4 py-2 hover:bg-surface-container-highest transition-colors">Exams</a>
                <a href="virtual.html" class="block px-4 py-2 hover:bg-surface-container-highest transition-colors">Virtual Class</a>
                <a href="about.html" class="block px-4 py-2 hover:bg-surface-container-highest transition-colors">About</a>
                <a href="services.html" class="block px-4 py-2 hover:bg-surface-container-highest transition-colors">Services</a>
                <a href="contact.html" class="block px-4 py-2 hover:bg-surface-container-highest transition-colors">Contact</a>
            </div>
        </div>
        
        <!-- Theme Toggle Button (preserved) -->
        <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
            <svg class="icon-moon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
            <svg class="icon-sun" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
        </button>
    </div>
</nav>
'@

# Get all HTML files (skip android/ and dist/ folders)
$htmlFiles = Get-ChildItem -Path . -Filter *.html -File -Recurse | Where-Object { $_.FullName -notmatch '\\android\\|\\dist\\' }

foreach ($file in $htmlFiles) {
    Write-Host "Processing: $($file.Name)"
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8

    # Replace the old navigation block with the new one
    $pattern = '<nav\s+id="main-nav".*?</nav>'
    if ($content -match $pattern) {
        $newContent = $content -replace $pattern, $newNav
        # Save with UTF8 without BOM
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($file.FullName, $newContent, $utf8NoBom)
        Write-Host "  Updated navigation in $($file.Name)"
    } else {
        Write-Host "  WARNING: No <nav id='main-nav'> found in $($file.Name)"
    }
}

Write-Host "`nDone. All navigation blocks updated with text-only links."