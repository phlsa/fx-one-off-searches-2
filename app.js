var suggestions = [
  {title: "Mozilla Firefox"},
  {title: "Mozilla Foundation"},
  {title: "Mongolia"},
  {title: "Mozillians"},
  {title: "Morbid Humor"},
  {title: "Mozart"},
  {title: "Mozfest"}
];

// Turn all IDs into selectable vars
varify();

// Typing
searchField.addEventListener( 'keyup', function(e) {
  popup.style.display = "block";
  if ( !contains( ["Up", "Down", "Left", "Right"], e.key ) ) {
    updateSuggestions();
  }
});

// Navigating
searchField.addEventListener( 'keydown', function(e) {
  if ( contains( ["Up", "Down", "Left", "Right"], e.key ) ) {
    // navigating
    var currentlyActive = select("#suggestion-container>li.active");
    var next = maybe(e.key==="Down" || e.key==="Right", 
                     currentlyActive.nextElementSibling, 
                     currentlyActive.previousElementSibling);
    if ( next ) {
      currentlyActive.classList.remove("active");
      next.classList.add("active");
      searchField.value = next.innerHTML;
      after( 5, function() {
        searchField.setSelectionRange( searchField.value.length, searchField.value.length );
      });
    }
  }
});

// Focusing
searchField.addEventListener( 'focus', function() {
  if ( searchField.value !== '' ) {
    popup.style.display = "block";
    updateSuggestions();
  }
});

searchField.addEventListener( 'blur', function() {
  popup.style.display = "none";
});

function updateSuggestions() {
  // typing
  var activeSuggestions = suggestions.filter( function( item ) {
    return item.title.toLowerCase().startsWith( searchField.value.toLowerCase() );
  });
  var newHTML = "";
  activeSuggestions.forEach( function( item, index ) {
    newHTML += "<li" + maybe(index===0, " class='active'", "") + ">" + item.title + "</li>";
  });
  inject( newHTML, suggestionContainer );

  inject( "Search <strong>"+ searchField.value +"</strong> on:", searchHeadline );
}




function collect(selector) {
  return document.querySelectorAll( selector );
}

function select(selector)  {
  return document.querySelectorAll( selector )[0];
}

function inject(content, element) {
  if ( typeof element === "string" ) {
    select( element ).innerHTML = content;
  } else {
    element.innerHTML = content;
  }
}

function maybe(test, trueValue, falseValue) {
  if ( test ) {
    return trueValue;
  } else {
    return falseValue;
  }
}

function contains(where, what) {
  if ( where.indexOf( what ) > -1 ) {
    return true;
  } else {
    return false;
  }
}

function varify(scope, target) {
  if ( !target ) { target = window };
  if ( !scope ) { scope = document };
  var elements = scope.querySelectorAll("[id]")
  for (var i=0; i<elements.length; i++) {
    var item = elements[i];
    target[camelCase( item.id )] = select( "#"+item.id );
  }
}

function camelCase(str) {
  return str.replace(/\W+(.)/g, function (x, chr) {
    return chr.toUpperCase();
  });
}

function after(time, fn) {
  window.setTimeout( fn, time );
}