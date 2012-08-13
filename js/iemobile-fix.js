// Conditional CSS for IEMobile (http://blogs.msdn.com/b/iemobile/archive/2010/12/08/targeting-mobile-optimized-css-at-windows-phone-7.aspx)
// doesn't seem to work on WP7.5 (Mango) emulator, so use useragent-based detection instead
if (navigator.userAgent.indexOf("IEMobile") >= 0) {
    document.body.className += " iemobile";
    window.onscroll = function () { window.scroll(0, 0) }
}