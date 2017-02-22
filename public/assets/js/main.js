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
        $(".button-collapse").sideNav('hide');
    });

    $(".data-link").click( function() {
        $(".index").hide();
        $(".data").show();
        $(".upload").hide();
        $(".button-collapse").sideNav('hide');
    });

    $(".upload-link").click( function() {
        $(".index").hide();
        $(".data").hide();
        $(".upload").show();
        $(".button-collapse").sideNav('hide');
    });
}

function uploadBtnClick() {
    $(".select-file").click( function() {
      $('input[type=file]').click();
      return false;
    });
    $("#upload").click(() => {
      let xhr = new XMLHttpRequest();
      let formData = new FormData();
      var file = document.getElementById("file-upload");
      formData.append('upload', file.files[0]);
      xhr.open('POST', '/match-data/', true);
      xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
      xhr.send(formData);
      alert("uploading");
    })
}


$(document).ready(function() {
    showIndex();
    loadSidebar();
    getCurrentYear();
    awaitNavActions();
    uploadBtnClick();
});
