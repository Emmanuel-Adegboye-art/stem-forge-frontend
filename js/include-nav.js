(function(){
    function insertNav(html){
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        const newMain = template.content.querySelector('#main-nav');
        const newAside = template.content.querySelector('#sidebar');

        // Replace or insert main nav
        const oldMain = document.getElementById('main-nav');
        if(oldMain && newMain){
            oldMain.replaceWith(newMain.cloneNode(true));
        } else if(newMain){
            document.body.insertBefore(newMain.cloneNode(true), document.body.firstChild);
        }

        // Replace or insert sidebar/aside
        const oldSidebar = document.getElementById('sidebar') || document.querySelector('nav.hidden.md\\:flex');
        if(oldSidebar && newAside){
            oldSidebar.replaceWith(newAside.cloneNode(true));
        } else if(newAside){
            // Put after main nav
            const after = document.getElementById('main-nav') || document.body.firstChild;
            after.insertAdjacentElement('afterend', newAside.cloneNode(true));
        }

        // Wire mobile toggle behavior
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('sidebar-backdrop');
        const sidebarClose = document.getElementById('sidebar-close');
        function openSidebar(){
            if(sidebar){ sidebar.classList.remove('-translate-x-full'); }
            if(backdrop){ backdrop.classList.remove('hidden'); }
        }
        function closeSidebar(){
            if(sidebar){ sidebar.classList.add('-translate-x-full'); }
            if(backdrop){ backdrop.classList.add('hidden'); }
        }
        if(mobileToggle) mobileToggle.addEventListener('click', openSidebar);
        if(sidebarClose) sidebarClose.addEventListener('click', closeSidebar);
        if(backdrop) backdrop.addEventListener('click', closeSidebar);

        // Theme toggle (if present) - basic switch of data-theme
        const themeButtons = document.querySelectorAll('.theme-toggle');
        themeButtons.forEach(btn => btn.addEventListener('click', function(){
            const html = document.documentElement;
            const current = html.getAttribute('data-theme') || 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            try{ localStorage.setItem('stemforge-theme', next); }catch(e){}
        }));
    }

    // Fetch the partial
    fetch('inc/nav.html', {cache: 'no-store'})
        .then(function(res){ if(!res.ok) throw new Error('Failed to load nav'); return res.text(); })
        .then(insertNav)
        .catch(function(err){ console.warn('include-nav.js:', err); });
})();
