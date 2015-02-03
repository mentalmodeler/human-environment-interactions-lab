var app = app || {};
app.sections = ['home', 'people', 'publications', 'research', 'teaching', 'software'];


app.updateHeaderHeight = function() {
    $("#content").css("top", $("header").height() + "px");
}

app.setActiveLink = function( href, from ) {
    return;

    //console.log('setActiveLink, href:',href,', from:',from);
    if (typeof href === 'undefined') {
        href = '#home';
    }
    $.each( app.$navlinks, function( index, elem) {
        var $elem = $(elem);
        if ( href === $elem.attr('href') ) {
            $elem.addClass('selected');
            $elem.blur();
        } else {
            $elem.removeClass('selected');
        }
    });
}
app.getViewportSize = function() {
    return { height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
             width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0) };
}
app.positionNav = function() {
    var $navlinks = $('ul.nav.navbar-nav');
    var headerHeight = app.$header.height();
    var top = headerHeight - $navlinks.height();
    //console.log('top:',top);
    $navlinks.css('top', top);
}

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
}

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
}


app.updateHeaderBgPos = function() {
    var headerHeight = app.$header.height();
    $('.section-header-bg.fixed-position').css('top', headerHeight );
}

app.updateBodyPadding = function() {
    var headerHeight = app.$header.height();
    app.bodyPaddingTop = headerHeight;
    $('body').css( 'padding-top', headerHeight );
}

app.getSectionFromScrollPosition = function(){
     var sectionHeaderHeight = 65;
     var fixedSection = '#home';
     var offset = $('body').scrollTop();
     var bodyPaddingTop = parseInt( $('body').css('padding-top'), 10);
     //console.log('before, fixedSection:',fixedSection,', bodyPaddingTop:',bodyPaddingTop);
     for (var i=1,l = this.sections.length; i<l; i++) {
        var section = this.sections[i];
        var scrollTop = app.$content.find(section).offset().top - bodyPaddingTop;
        if ( offset >= scrollTop ) {
            fixedSection = section;
        }
     }
     //console.log('after, fixedSection:',fixedSection);
     var fSection = fixedSection.substr(1);
     var $bgs = $('#content').find('.section-header-bg');
     /*
     $bgs.each( function() {
        var $sectionHeader = $(this);
        var $section = $sectionHeader.closest('.section')
        var $sectionContent = $section.find('.section-content');
        var sectionId = $section.attr('id');

        if ( fSection === sectionId ) {
            $sectionHeader.addClass('fixed-position');
            $sectionHeader.css('top', app.$header.height());
            $sectionContent.addClass('fixed-position-header');
            app.setHash(fixedSection);
        } else {
            $sectionHeader.removeClass('fixed-position');
            $sectionContent.removeClass('fixed-position-header');
        }
     });
    */
     this.setActiveLink( fixedSection, 'getSectionFromScrollPosition' );
    
     if (offset <= 0) {
        $bgs.each( function() {
            var $bg = $(this);
            $bg.removeClass('fixed-position');
            $bg.next().removeClass('fixed-position-header');
        });
     } else {
           
     }

     return fixedSection;
}

app.scrollToSection = function( href ) {
    if ( this.sections.indexOf(href) !== -1 ) {
        var top = this.$content.find(href).offset().top;
        var headerHeight = this.$header.height();
        var scrollTop = top - headerHeight;
        //console.log('href:',href,', top:',top,', headerHeight:',headerHeight,', scrollTop:',scrollTop);
        this.$root.animate({
            scrollTop: scrollTop
        }, 500, (function(app, scrollTop){ return function() {
            app.setHash(href);
            //app.getSectionFromScrollPosition();
            //app.$root.scrollTop( scrollTop );
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
    $body.scrollspy( { target: navSelector, offset: app.bodyPaddingTop} );
    
    $(navSelector).on('activate.bs.scrollspy', function ( e ) {
        //var $currentItem = $('.nav li.active > a > span');
        app.onSectionChange( $( e.target ) );
        
    });
}

app.onSectionChange = function ( $li ) {
    var hash = $li.find( 'a' ).attr( 'href' ); //.substring( 1 );
    var section = hash.substring( 1 );
    app.setHash( hash );
    // update header
    var $stickyHeader = $('#stickySectionHeader');
    $stickyHeader.removeClass().addClass( section );
    $stickyHeader.find('.container').hide();
    $stickyHeader.find('.container.' + section ).show();
    var zIdx = (app.sections.indexOf( hash ) + 1) * 10;
    console.log('app.sectionNames:',app.sections,', zIdx:',zIdx);
    $stickyHeader.find('.section-header-bg').css('z-index', zIdx);
    console.log('onSectionChange, section:',section );
}

$( document ).ready( function() {
    app.sections = [ '#home', '#people', '#publications', '#research', '#teaching', '#software' ];
    app.$content = $('#content');
    app.$root = $('body');
    app.$header = $('header');
    app.$navlinks = $('header nav a[href]')
    // init scroll to section on click
    app.$navlinks.click(function(e) {
        e.stopImmediatePropagation();
        e.preventDefault();
        var href = $(this).attr('href');
        $('nav.navbar-collapse').removeClass('in');
        return app.scrollToSection( href );
    });    
    // add scroll listening
    /*
    $(window).scroll( function() {
        app.getSectionFromScrollPosition();
    })
    */
    // add resize listening
    $(window).resize( function() {
        app.updateBodyPadding();
        app.updateHeaderBgPos();
        app.setBrandingWidth();    
        app.getSectionFromScrollPosition();
    });
    // initial call
    app.updateBodyPadding();
    app.updateHeaderBgPos();
    app.setBrandingWidth();
    //app.scrollToSection( window.location.hash );

    app.initScrollSpy();
});