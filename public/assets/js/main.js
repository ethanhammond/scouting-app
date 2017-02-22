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
  $("#upload-progress").hide();
  $(".select-file").click( function() {
    $('input[type=file]').click();
    return false;
  });
  $('#upload').on('click', function (){
    $('#file-upload').click();
    $("#upload-progress").show();
  });

  $('#upload-input').on('change', function(){

    var files = $(this).get(0).files;

    if (files.length > 0){
      // create a FormData object which will be sent as the data payload in the
      // AJAX request
      var formData = new FormData();

      // loop through all the selected files and add them to the formData object
      for (var i = 0; i < files.length; i++) {
        var file = files[i];

        // add the files to formData object for the data payload
        formData.append('uploads[]', file, file.name);
      }

      $.ajax({
        url: '/match-data',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data){
          console.log('upload successful!\n' + data);
        },
        xhr: function() {
          // create an XMLHttpRequest
          var xhr = new XMLHttpRequest();

          // listen to the 'progress' event
          xhr.upload.addEventListener('progress', function(evt) {

            if (evt.lengthComputable) {
              // calculate the percentage of upload completed
              var percentComplete = evt.loaded / evt.total;
              percentComplete = parseInt(percentComplete * 100);

              // update the Bootstrap progress bar with the new percentage
              $('.progress-bar').text(percentComplete + '%');
              $('.progress-bar').width(percentComplete + '%');

              // once the upload reaches 100%, set the progress bar text to done
              if (percentComplete === 100) {
                $('.progress-bar').html('Done');
              }

            }

          }, false);

          return xhr;
        }
      });

    }
  });
}


$(document).ready(function() {
    showIndex();
    loadSidebar();
    getCurrentYear();
    awaitNavActions();
    uploadBtnClick();
});
