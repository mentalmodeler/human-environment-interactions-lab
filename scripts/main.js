var app = app || {};
app.sections = ['home', 'people', 'publications', 'research', 'teaching', 'software'];
app.sectionHeaderHeight = 65;

app.updateHeaderHeight = function() {
    $("#content").css("top", $("header").height() + "px");
};

app.setActiveLink = function( hash ) {
    console.log('setActiveLink, hash:',hash);
    if (typeof hash === 'undefined') { hash = '#home'; }
    $('#nav-scroll li').removeClass('active');
    var $activeLink = $('#nav-scroll li a[href="'+hash+'"]');
    $activeLink.closest('li').addClass('active');
};

app.getViewportSize = function() {
    return { height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
             width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0) };
};

app.positionNav = function() {
    var $navlinks = $('ul.nav.navbar-nav');
    var headerHeight = app.$header.height();
    var top = headerHeight - $navlinks.height();
    //console.log('top:',top);
    $navlinks.css('top', top);
};

app.setHash = function(hash) {
    if ( history && history.pushState ) {
        history.pushState({}, "", hash);
    } else {
        var scrollV = document.body.scrollTop;
        var scrollH = document.body.scrollLeft;
        window.location.hash = hash;
        document.body.scrollTop = scrollV;
        document.body.scrollLeft = scrollH;
    }
};

app.setBrandingWidth = function() {
    var vs = this.getViewportSize();
    var brandWidth = 'initial';
    var navWidth = $('header.navbar > .container').width(); //$('nav.navbar-collapse').outerWidth();
    if ( vs.width > 768 ) {
        var $navlinks = $('ul.nav.navbar-nav');
        var linksWidth = $navlinks.outerWidth();
        brandWidth = navWidth - linksWidth;
    } else {
        var $navlinks = $('button.navbar-toggle');
        var linksWidth = $navlinks.outerWidth(true);
        brandWidth = navWidth - linksWidth;
    }
    $('a.navbar-brand').css('max-width', brandWidth );
};

app.updateHeaderBgPos = function() {
    var headerHeight = app.$header.height();
    $('.section-header-bg.fixed-position').css('top', headerHeight );
};

app.updateBodyPadding = function( useSectionHeaderHeight ) {
    console.log('updateBodyPadding, app.$header.height():',app.$header.height() );
    var headerHeight = app.$header.height();
    app.bodyPaddingTop = headerHeight;
    $('body').css( 'padding-top', headerHeight );
};

app.getSectionFromScrollPosition = function(){
    var sectionHeaderHeight = 65;
    var fixedSection = '#home';
    var offset = $('body').scrollTop();
    var bodyPaddingTop = app.bodyPaddingTop; //parseInt( $('body').css('padding-top'), 10);
    console.log('getSectionFromScrollPosition, fixedSection:',fixedSection,', (body).scrollTop():',offset,' bodyPaddingTop:',bodyPaddingTop);
    for (var i=1,l = this.sections.length; i<l; i++) {
        var section = this.sections[i];
        var scrollTop = app.$content.find(section).offset().top - bodyPaddingTop;
        console.log('       ',section,'scrollTop:',scrollTop);
        if ( offset >= scrollTop ) {
            fixedSection = section;
        }
    }
    console.log('                    after, fixedSection:',fixedSection);
    //this.setActiveLink( fixedSection, 'getSectionFromScrollPosition' );
    return fixedSection;
};

app.scrollToSection = function( href, doSetSection ) {
    if ( typeof doSetSection === 'undefined') {
        doSetSection = false;
    }
    if ( this.sections.indexOf(href) !== -1 ) {
        var top = this.$content.find(href).offset().top;
        var headerHeight = this.$header.height();
        var scrollTop = top - (headerHeight - 1);
        var duration = 500;
        console.log('app.scrollToSection > href:',href,', top:',top,', headerHeight:',headerHeight,', scrollTop:',scrollTop);
        this.$root.animate({
            scrollTop: scrollTop
        }, duration, (function(app, scrollTop){ return function() {
            app.setHash(href);
            if ( doSetSection ) {
                console.log('doSetSection href:',href);
                app.onSectionChange( href, 'app.scrollToSection' );
                app.setActiveLink( href );
            }
        };
        })(app, scrollTop) );
        return false;
    }
    else {
        return true;
    }
}

app.initScrollSpy = function() {
    var navSelector = '#nav-scroll'
    var $body = $( 'body' );
    $body.css( 'position', 'relative' );
    $body.attr( { 'data-spy': 'scroll', 'data-target': navSelector } );
    console.log('initScrollSpy, app.bodyPaddingTop:',app.bodyPaddingTop);
    $body.scrollspy( { target: navSelector, offset: app.bodyPaddingTop} );
    
    $(navSelector).on('activate.bs.scrollspy', function ( e ) {
        //var $currentItem = $('.nav li.active > a > span');
        var sectionHash = $( e.target ).find( 'a' ).attr( 'href' )
        var headerHeight = app.$header.height();
        app.onSectionChange( sectionHash, 'activate.bs.scrollspy' );
    });
};

app.onSectionChange = function ( hash, calledFrom ) { // $li ) {
    //var hash = $li.find( 'a' ).attr( 'href' );
    var top = this.$content.find(hash).offset().top;
    var headerHeight = this.$header.height();
    var scrollTop = top - (headerHeight - 1);
    var section = hash.substring( 1 );
    app.setHash( hash );
    console.log('onSectionChange > section:',section,', calledFrom:',calledFrom,', top:',top,', headerHeight:',headerHeight,', scrollTop:',scrollTop);
    // update header
    app.$stickyHeader.removeClass().addClass( section );
    app.$stickyHeader.find('.container').hide();
    app.$stickyHeader.find('.container.' + section ).show();
    var zIdx = (app.sections.indexOf( hash ) + 1) * 10;
    //console.log('app.sectionNames:',app.sections,', zIdx:',zIdx);
    app.$stickyHeader.find('.section-header-bg').css('z-index', zIdx);
};

app.setInitialSection = function() {
    var sectionHash = app.autoClickLinkFromHash();
    var section = sectionHash.substr(1);
    //app.setActiveLink( sectionHash );
    app.$stickyHeader.find('.container').hide();
    app.$stickyHeader.find('.container.' + section ).show();
};

app.autoClickLinkFromHash = function() {
    var sectionHash = window.location.hash;
    if ( sectionHash.length === 0 ) {
        sectionHash = '#home';
    }
    console.log('app.autoClickLinkFromHash, sectionHash:',sectionHash);
    //$('header nav a[href="'+sectionHash+'"]').click();
    app.scrollToSection( sectionHash, true );
    return sectionHash;
};

$( document ).ready( function() {
    app.sections = [ '#home', '#people', '#publications', '#research', '#teaching', '#software' ];
    app.$content = $('#content');
    app.$root = $('body');
    app.$header = $('header');
    app.$navlinks = $('header nav a[href]')
    app.$stickyHeader = $('#stickySectionHeader');
    
    // init scroll to section on click
    app.$navlinks.click(function(e) {
        e.stopImmediatePropagation();
        e.preventDefault();
        var href = $(this).attr('href');
        console.log('link clicked > href:',href);
        $('nav.navbar-collapse').removeClass('in');
        return app.scrollToSection( href );
    });    
    window.onhashchange = function() {
        app.autoClickLinkFromHash();
    };
    // add resize listening
    $(window).resize( function() {
        app.updateBodyPadding();
        app.updateHeaderBgPos();
        app.setBrandingWidth();    
        var section = app.getSectionFromScrollPosition();
        app.onSectionChange( section, 'window.resize' );
    });

    // initial call
    app.updateBodyPadding( true );
    app.updateHeaderBgPos();
    app.setBrandingWidth();
    app.initScrollSpy();
    app.timeoutId = window.setTimeout( app.setInitialSection, 250);
});