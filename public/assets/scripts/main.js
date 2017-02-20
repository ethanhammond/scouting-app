function showIndex() {
    $(".index").show();
    $(".data").hide();
    $(".upload").hide();
}

function loadSidebar() {
    $(".button-collapse").sideNav();
}

function getCurrentYear() {
    var currentYear = (new Date).getFullYear();
    $("#copyright-year").html(currentYear);
}

function awaitNavActions() {
    $(".index-link").click( function() {
        $(".index").show();
        $(".data").hide();
        $(".upload").hide();
    })

    $(".data-link").click( function() {
        $(".index").hide();
        $(".data").show();
        $(".upload").hide();
    });

    $(".upload-link").click( function() {
        $(".index").hide();
        $(".data").hide();
        $(".upload").show();
    });
}

$(document).ready(function() {
    showIndex();
    loadSidebar();
    getCurrentYear();
    awaitNavActions();
});