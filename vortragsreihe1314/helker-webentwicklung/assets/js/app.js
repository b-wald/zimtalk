/*** initial settings ***/
var list_settings = {
  'standard' : { 'id' : "", 'icon' : 'fa-file-text-o', 'value' :null },
  'shopping' : { 'id' : '#cost', 'icon' : 'fa-shopping-cart', 'value' : ' Euro' },
  'parking' : { 'id' : '#parkinglot', 'icon' : 'fa-road', 'value' : '. Etage' },
  'restaurant' : { 'id' : '#rating', 'icon' : 'fa-cutlery', 'value' : ' Sterne' }
};
var latitude,longitude;

$(document).ready(function() {
  renderList();
});

$(document).bind("pagebeforechange", function( event, data ) {
  $.mobile.pageData = (data && data.options && data.options.pageData) ? data.options.pageData : null;
});

/*** geolocation ***/
function initiate_geolocation() {
  navigator.geolocation.getCurrentPosition(handle_geolocation_query,handle_errors);
}

function handle_geolocation_query(position) {
  latitude=position.coords.latitude;
  longitude=position.coords.longitude;
  $.mobile.loading("hide");
  $("#createform").show();
}

function handle_errors(error) {
  $.mobile.loading("hide");
  $("#nolocation").popup( "open" );
}

/*** list operations ***/
function renderList() {
  $("#notes").empty();
  for (var key in localStorage){
    json = localStorage.getItem(key);
    if(json) {
      note = JSON.parse(json);
      var date = new Date(note[0]["timestamp"]);
      var ts = date.getDate()+'.'+(date.getMonth()+1);
      var value = (note[0]["value"]) ? '<span class="ui-li-count">'+note[0]["value"]+list_settings[note[0]["category"]]["value"]+'</span>' : "";
      $("#notes").append('<li id="'+key+'" data-icon="false"><a href="#detail?id='+key+'"><div class="ui-li-category"><i class="fa '+list_settings[note[0]["category"]]["icon"]+'"></i></div><h3>'+note[0]["title"]+'</h3><p>'+note[0]["text"]+'</p>'+value+'</a></li>');
    }
  }
  $('#notes').listview().listview('refresh');
}

$("#list").on( "swiperight", function( e ) {
  setTimeout(function() {
    $("#settings").panel( "open" );
  }, 0);
});

/*** detail operations ***/
$("#detail").on("pageshow", function (e,data) {
  if($.mobile.pageData && $.mobile.pageData.id) {
    for (var key in localStorage){
      if(key==$.mobile.pageData.id) {
        //Note gefunden
        json = localStorage.getItem(key);
        if(json) {
          note = JSON.parse(json);
          $('#detail .ui-title').text(note[0]["title"]);
          $('#noteid').text(key);
          $('#map_url_apple').attr('href','http://maps.apple.com/?ll='+note[0]["latitude"]+','+note[0]["longitude"]);
          $('#map_url_google').attr('href','http://maps.google.com/?ll='+note[0]["latitude"]+','+note[0]["longitude"]);
          var start = new google.maps.LatLng(note[0]["latitude"], note[0]["longitude"]);
          $('#map_canvas').gmap({'zoom':12, 'center': start}).bind('init', function(ev, map) {
            $('#map_canvas').gmap('addMarker', { 'position': map.getCenter(), 'bounds': false});
          });
          
        }
      }
    }
  }
});

function deleteNote() {
  removeNote($('#noteid').text());
  window.location.href = "/";
}
          
/*** note operations ***/

$("#create").on("pagebeforeshow", function (e) {
  $(".categoryelement").hide();
  $("#createform").hide();
  $("#createform")[0].reset();
});
$("#create").on("pageshow", function (e) {
  $.mobile.loading( "show", {
    text: "Lokalisiere Standort...",
    textVisible: true,
    theme: "b",
    html: ""
  });
  initiate_geolocation();
});

$('#category').change(function() {
  var optionSelected = $("option:selected", this);
  var valueSelected = this.value;
  $(".categoryelement").hide();
  $(list_settings[valueSelected]['id']).show();
});

function createNote() {
  var timestamp=new Date().getTime();
  var note = [{
    'timestamp' : timestamp,
    'category' : $( "#category option:selected").val(),
    'title' : $('#title').val(),
    'text' : $('#text').val(),
    'value' : $('input[name="value"]:visible').val(),
    'latitude' : latitude,
    'longitude' : longitude,
  }];
  localStorage.setItem('note_'+timestamp, JSON.stringify(note));
  renderList();
}

function removeNote(key) {
  localStorage.removeItem(key);
  renderList();
}

/*** settings operations ***/
function resetApp() {
  if(confirm("App wirklich zurücksetzen?")) {
    localStorage.clear();
    location.reload();
  }
}