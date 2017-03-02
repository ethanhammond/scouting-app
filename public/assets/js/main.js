function showIndex() {
  $(".data").show();
  $(".upload").hide();
  $(".team-detail").hide();
  $(".event-detail").hide();
}

function loadSidebar() {
  $(".button-collapse").sideNav();
}

function getCurrentYear() {
  var currentYear = (new Date).getFullYear();
  $(".copyright-year").html(currentYear);
}

function awaitNavActions() {
  $(".data-link").click( function() {
    $(".data").show();
    $(".upload").hide();
    $(".team-detail").hide();
    $(".event-detail").hide();
    $(".button-collapse").sideNav('hide');
  });

  $(".upload-link").click( function() {
    $(".data").hide();
    $(".upload").show();
    $(".team-detail").hide();
    $(".event-detail").hide();
    $(".button-collapse").sideNav('hide');
    console.log('wat');
  });
}

function uploadBtnClick() {
  $(".select-file").click( function() {
    $('input[type=file]').click();
    return false;
  });

  $("#upload").click( function() {
    let xhr = new XMLHttpRequest();
    let formData = new FormData();
    let file = document.getElementById("file-upload");
    formData.append('upload', file.files[0]);
    xhr.open('POST', '/match-data', true);
    xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
    xhr.send(formData);
  });
}

function loadData() {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', '/team-list', true);
  xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
  xhr.send();
  xhr.onload = function() {
    document.getElementById('data').innerHTML = xhr.responseText;
    console.log(xhr.responseText);
    $(".team-listing").click( function() {
      loadTeamDetail(this.innerHTML);
    });
  };
}

function loadTeamDetail(teamNumber) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://www.thebluealliance.com/api/v2/team/frc' + teamNumber, true);
  xhr.setRequestHeader('X-TBA-App-Id', 'frc3618:scouting-app:v01');
  xhr.send();
  xhr.onload = function() {
    let teamData = JSON.parse(xhr.responseText);
    let teamName = teamData.nickname;
    $(".team-info").text(`${teamNumber} - ${teamName}`);
    $("#blue-alliance-link").attr('href', `https://www.thebluealliance.com/team/${teamNumber}`);
    $(".data").hide();
    $(".team-detail").show();
    loadTeamSummary(teamNumber);
  };
}

function loadEventList(teamNumber) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', '/event-list/' + teamNumber, true);
  xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
  xhr.send();
  xhr.onload = function() {
    // console.log(xhr.responseText);
    document.getElementById('event-list').innerHTML = xhr.responseText;
    $(".team-listing").click( function() {
      loadEventDetail(teamNumber, this.innerHTML);
    });
  }
}

function loadEventDetail(teamNumber, eventCode) {
  alert(`loading event: ${eventCode}, team: ${teamNumber}`);
}

function loadTeamSummary(teamNumber) {
  console.log('team summary loading: ' + teamNumber)
  let xhr = new XMLHttpRequest();
  xhr.open('GET', '/team-summary/' + teamNumber, true);
  xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
  xhr.send();
  xhr.onload = function() {
    // console.log(xhr.responseText);
    document.getElementById('team-summary').innerHTML = xhr.responseText;
    $('.collapsible').collapsible();
    loadEventList(teamNumber);
  }
}

$(document).ready(function() {
  showIndex();
  loadSidebar();
  getCurrentYear();
  awaitNavActions();
  uploadBtnClick();
  loadData();
});
