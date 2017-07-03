var app = app || {};

app.setActiveLink = function( hash ) {
    app.log('setActiveLink, hash:',hash);
    if (typeof hash === 'undefined') { hash = '#home'; }
    $('#nav-scroll li').removeClass('active');
    var $activeLink = $('#nav-scroll li a[href="'+hash+'"]');
    $activeLink.closest('li').addClass('active');
};

app.getViewportSize = function() {
    return { height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
             width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0) };
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

app.updatedSizeAndPosition = function() {
    var headerHeight = app.$header.height();
    // set body padding top
    app.bodyPaddingTop = headerHeight;
    $('body').css( 'padding-top', headerHeight );
    // set sticky header top postion
    app.$stickyHeaderSectionHeaderBg.css('top', headerHeight );
    // set branding width
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
    //$('a.navbar-brand').css('max-width', brandWidth );
};

app.getSectionFromScrollPosition = function(){
    var sectionHeaderHeight = app.getSectionHeaderHeight(); //65;
    var fixedSection = ''; //#home';
    var offset = $('body').scrollTop();
    var bodyPaddingTop = app.bodyPaddingTop;
    app.log('getSectionFromScrollPosition, fixedSection:',fixedSection,', (body).scrollTop():',offset,' bodyPaddingTop:',bodyPaddingTop);
    for (var i=0,l = this.sections.length; i<l; i++) {
        var section = this.sections[i];
        var scrollTop = app.$content.find(section).offset().top - bodyPaddingTop;
        app.log('       ',section,'scrollTop:',scrollTop);
        if ( offset >= scrollTop ) {
            fixedSection = section;
        }
    }
    app.log('                    after, fixedSection:',fixedSection);
    if ( fixedSection !== '' ) {
      this.setActiveLink( fixedSection, 'getSectionFromScrollPosition' );
    }
    return fixedSection;
};

app.scrollToSection = function( href, doSetSection ) {
    if ( typeof doSetSection === 'undefined') {
        doSetSection = false;
    }
    app.log('app.scrollToSection > href:',href,', doSetSection:',doSetSection);
    if ( this.sections.indexOf(href) !== -1 ) {
        var top = this.$content.find(href).offset().top;
        var headerHeight = this.$header.height();
        var scrollTop = top - (headerHeight - 1);
        var duration = 500;
        app.log('        top:',top,', headerHeight:',headerHeight,', scrollTop:',scrollTop);
        this.$root.animate({
            scrollTop: scrollTop
        }, duration, (function(app, scrollTop){ return function() {
            app.setHash(href);
            if ( doSetSection ) {
                app.log('          doSetSection href:',href);
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
};

app.getSectionHeaderHeight = function() {
    return app.$stickyHeaderSectionHeaderBg.outerHeight();
};

app.initScrollSpy = function() {
    var navSelector = '#nav-scroll'
    var $body = $( 'body' );
    $body.attr( { 'data-spy': 'scroll', 'data-target': navSelector } );
    $body.scrollspy( { target: navSelector, offset: app.bodyPaddingTop} );

    $(navSelector).on('activate.bs.scrollspy', function ( e ) {
        var sectionHash = $( e.target ).find( 'a' ).attr( 'href' )
        console.log('activate.bs.scrollspy, sectionHash:',sectionHash );
        app.onSectionChange( sectionHash, 'activate.bs.scrollspy' );
    });
};

app.onSectionChange = function ( hash, calledFrom ) { // $li ) {
    var $elem = this.$content.find(hash);
    var top = $elem.offset().top;
    var headerHeight = this.$header.height();// - 1;
    var scrollTop = top - headerHeight;
    var boundingRectTop = $elem[0].getBoundingClientRect().top;
    var section = hash.substring( 1 );
    app.setHash( hash );
    app.log('onSectionChange > section:',section,', calledFrom:',calledFrom,', top:',top,', headerHeight:',headerHeight,', scrollTop:',scrollTop);
    console.log('onSectionChange > section:',section,', boundingRectTop:',boundingRectTop,', headerHeight:',headerHeight);
    // update header
    // this check keeps the header from switching on the last section if it isnt all the way to the top
    if ( boundingRectTop <= headerHeight ) {
        app.updateHeader();    
    }
};

app.updateHeader = function() {
    var hash = app.getSectionFromHash();
    var section = hash.substring( 1 )
    console.log('---- updateHeader, section:',section,', hash:',hash);
    app.$stickyHeader.removeClass().addClass( section );
    app.$stickyHeader.find('.container').hide();
    app.$stickyHeader.find('.container.' + section ).show();
    var zIndex = (app.sections.indexOf( hash ) + 1) * 10;
    app.$stickyHeaderSectionHeaderBg.css('z-index', zIndex );
}

app.setInitialSection = function() {
    var sectionHash = app.getSectionFromHash();
    app.log('app.setInitialSection, sectionHash:',sectionHash );
    app.scrollToSection( sectionHash, true );
};

app.getSectionFromHash = function() {
    var sectionHash = window.location.hash;
    app.log('app.getSectionFromHash, sectionHash:',sectionHash);
    if ( sectionHash.length === 0 ) {
        sectionHash = '#home';
        app.log('    setting sectionHash to #home');
    }
    return sectionHash;
};
app.onWindowResize = _.debounce( function() {
    app.updatedSizeAndPosition();
    var section = app.getSectionFromScrollPosition();
    if ( section !== '') {
        app.onSectionChange( section, 'window.resize' );
    }
}, 300);

app.log = function() {
    if ( app.doLog ) { console.log.apply( console, arguments ); }
};

$( document ).ready( function() {
    // set app variables
    app.doLog = false;
    app.sections = [
        '#home',
        '#people',
        '#publications',
        '#research',
    //    '#teaching',
        '#software'
    ];
    app.$content = $('#content');
    app.$root = $('body');
    app.$header = $('header');
    app.$navlinks = $('header nav a[href]')
    app.$stickyHeader = $('#stickySectionHeader');
    app.$stickyHeaderSectionHeaderBg = app.$stickyHeader.find('.section-header-bg');

    // init scroll to section on click
    app.$navlinks.click(function(e) {
        e.stopImmediatePropagation();
        e.preventDefault();
        // collapses dropdown menu for width < 768px
        $('nav.navbar-collapse').removeClass('in');
        return app.scrollToSection( $(this).attr('href') );
    });
    // add hash change listener
    window.onhashchange = function() {
        app.scrollToSection( app.getSectionFromHash(), true );
    };
    // add resize listening
    $(window).resize( app.onWindowResize );

    // initial call
    app.updatedSizeAndPosition();
    app.initScrollSpy();
    app.timeoutId = window.setTimeout( app.setInitialSection, 250);
});