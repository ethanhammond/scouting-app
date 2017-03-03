function showIndex() {
  display(".data");
  $("#main").show();
}

function display(id) {
  $("#main").children().hide();
  $(".button-collapse").sideNav('hide');
  $(id).show();
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
    display(".data");
  });

  $(".upload-link").click( function() {
    display(".upload");
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
    $(".blue-alliance-link").attr('href', `https://www.thebluealliance.com/team/${teamNumber}`);
    display(".team-detail");
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
    $(".event-listing").click( function() {
      loadEventDetail(teamNumber, this.innerHTML);
    });
  }
}

function loadEventDetail(teamNumber, eventCode) {
  console.log(`loading event: ${eventCode}, team: ${teamNumber}`);
  let xhr = new XMLHttpRequest();
  let TBAEventCode = '2017' + eventCode.replace('frc', '');
  console.log(eventCode)
  xhr.open('GET', 'https://www.thebluealliance.com/api/v2/event/' + TBAEventCode, true);
  xhr.setRequestHeader('X-TBA-App-Id', 'frc3618:scouting-app:v01');
  xhr.send();
  xhr.onload = function() {
    console.log(xhr.responseText);
    let eventData = JSON.parse(xhr.responseText);
    let eventName = eventData.name;
    $(".blue-alliance-link").attr('href', `https://www.thebluealliance.com/event/${TBAEventCode}`);
    $(".event-info").text(eventName);
    display(".event-detail");
    loadEventSummary(teamNumber, eventCode);
  };
}

function loadEventSummary(teamNumber, eventCode) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', `/event-summary/${eventCode}/${teamNumber}`, true);
  xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
  xhr.send();
  xhr.onload = function() {
    console.log(xhr.responseText);
    document.getElementById('event-summary').innerHTML = xhr.responseText;
    $('.collapsible').collapsible();
    loadMatchList(teamNumber, eventCode);
  }
}

function loadMatchList(teamNumber, eventCode) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', `/match-list/${eventCode}/${teamNumber}`, true);
  xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
  xhr.send();
  xhr.onload = function() {
    console.log(xhr.responseText);
    document.getElementById('match-list').innerHTML = xhr.responseText;
    $(".match-listing").click(function() {
      loadMatchDetail(teamNumber, eventCode, this.innerHTML);
    });
  }
}

function loadMatchDetail(teamNumber, eventCode, roundNumber) {
  let xhr = new XMLHttpRequest();
  let TBAEventCode = '2017' + eventCode.replace('frc', '');
  let matchKey = `${TBAEventCode}_qm${roundNumber}`;
  console.log(eventCode);
  console.log(matchKey);
  $(".blue-alliance-link").attr('href', `https://www.thebluealliance.com/match/${TBAEventCode}`);
  $(".match-info").text('Match ' + roundNumber);
  display(".match-detail");
  loadMatchSummary(teamNumber, eventCode, roundNumber);
}

function loadMatchSummary(teamNumber, eventCode, roundNumber) {
  let xhr = new XMLHttpRequest();
  xhr.open('GET', `/match-summary/${eventCode}/${teamNumber}/${roundNumber}`, true);
  xhr.setRequestHeader('x-requested-with', 'XMLHttpRequest');
  xhr.send();
  xhr.onload = function() {
    // console.log(xhr.responseText);
    document.getElementById('match-summary').innerHTML = xhr.responseText;
    $('.collapsible').collapsible();
  }
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

function addHomeLink() {
  $(".index-link").click(function() {
    showIndex();
  });
}

$(document).ready(function() {
  showIndex();
  addHomeLink();
  loadSidebar();
  getCurrentYear();
  awaitNavActions();
  uploadBtnClick();
  loadData();
});
