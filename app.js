var suggestions = [
  {title: ""},
  {title: "Mozilla Firefox"},
  {title: "Mozilla Foundation"},
  {title: "Mongolia"},
  {title: "Mozillians"},
  {title: "Morbid Humor"},
  {title: "Mozart"},
  {title: "Mozfest"}
];
var originalQuery = "";

// Turn all IDs into selectable vars
varify();

// Typing
searchField.addEventListener( 'keyup', function(e) {
  if ( searchField.value !== '' ) {
    popup.style.display = "block";
    popup.classList.remove('advanced-mode');
  } else {
    popup.style.display = "none";
  }
  if ( !contains( ["Up", "Down", "Left", "Right", "Tab"], e.key ) ) {
    originalQuery = searchField.value;
    updateSuggestions();
  }
});



// Navigating
searchField.addEventListener( 'keydown', function(e) {
  pre.innerHTML = post.innerHTML = "";
  
  // Abort if the pressed key is not a navigation key
  if ( !contains(["Up", "Down", "Left", "Right", "Tab", "Enter"], e.key) ) {
    return;
  }

  var leavingCurrentRange = false;
  var currentlyActive = select("li.active");
  var next = null;

  // Pressing enter
  if ( e.key === "Enter" ) {
    popup.style.display = 'none';
    popup.classList.remove('advanced-mode');
    searchIcon.style.opacity = 0;
    all(oneOffItems, function(item) {
      item.classList.remove('preselected');
    });
    searchField.blur();
    return;
  }

  // Navigating
  if ( contains( ["Up", "Down", "Left", "Right"], e.key ) ) {
    next = maybe(e.key==="Down" || e.key==="Right", 
                     currentlyActive.nextElementSibling, 
                     currentlyActive.previousElementSibling);

  }

  // Tab navigation
  if ( e.key === "Tab" ) {
    e.preventDefault();
    if ( currentlyActive.parentElement.id==="suggestion-container" || !currentlyActive.nextElementSibling ) {
      leavingCurrentRange = true;
    } else {
      next = currentlyActive.nextElementSibling;
    }
  }

  // Jump to the next entry
  if ( next ) {
    after( 5, function() {
      searchField.setSelectionRange( searchField.value.length, searchField.value.length );
    });
  } else {
    leavingCurrentRange = true;
  }

  // Jumping in and out of the current navigation section
  if (leavingCurrentRange) {
    currentlyActive.classList.remove("active");
    var nextSection;

    if ( currentlyActive.parentElement.id === "suggestion-container" ) {
      nextSection = oneOffs;
    } else {
      nextSection = suggestionContainer;
    }

    if ( e.key!=="Tab" ) {
      searchField.value = originalQuery;
      inject( "Search <strong>"+ searchField.value +"</strong> on:", searchHeadline );
    }

    if ( e.key==="Down" || e.key==="Right" || e.key==="Tab" ) {
      next = nextSection.children[0];
    } else {
      next = nextSection.children[nextSection.children.length-1];
    }
  }

  // Update the highlight
  currentlyActive.classList.remove("active");
  next.classList.add("active");
  if ( next.parentElement.id==="suggestion-container" ) {
    all(collect("li"), function(item) {item.classList.remove("half-active")});
    searchField.value = next.innerHTML;
    inject( "Search <strong>"+ searchField.value +"</strong> on:", searchHeadline );
  } else {
    if (currentlyActive.parentElement.id==="suggestion-container") {
      currentlyActive.classList.add("half-active");
    }
  }
});


function bindHoverHandlers() {
  var items = collect("li");
  all(items, function(item) {
    item.addEventListener("mouseover", function(e) {
      all(items, function(otherItem) {
        otherItem.classList.remove("active", "half-active");
      });

      item.classList.add("active");
      if ( item.parentElement.id==="suggestion-container" ) {
        var typedValue = searchField.value;
        var fullValue = item.innerHTML;
        var completedValue = fullValue.toLowerCase().split(typedValue.toLowerCase())[1];
        if (completedValue) {
          pre.innerHTML = typedValue;
          post.innerHTML = completedValue;
          //inject( "Search <strong>"+ searchField.value +"</strong> on:", searchHeadline );
        }
      } else {
        pre.innerHTML = post.innerHTML = "";
      }
    });
  });
}


popup.addEventListener("mouseout", function(e) {
  all(collect("li"), function(item) {item.classList.remove("active")});
  pre.innerHTML = post.innerHTML = "";
});


// Focusing
searchField.addEventListener( 'focus', function() {
  if ( searchField.value !== '' ) {
    popup.style.display = "block";
    popup.classList.remove('advanced-mode');
    updateSuggestions();
  }
});

searchField.addEventListener( 'blur', function() {
  //popup.style.display = "none";
});


// Search Icon
searchIcon.addEventListener( 'click', function() {
  popup.style.display = "block";
  popup.classList.add('advanced-mode');
  searchField.focus();
});

// One-off icons in advanced mode
var oneOffItems = collect('#one-offs li');
all( oneOffItems, function(item) {
  item.addEventListener('mouseover', function() {
    if (popup.classList.contains('advanced-mode')) {
      searchField.placeholder = item.title;
      searchTitle.innerHTML =  item.title + " Search";
    }
  });
  item.addEventListener('mouseout', function() {
    var str = "Search";
    if ( select('.preselected') ) {
      str = select('.preselected').title;
    }
    searchField.placeholder = str;
    searchTitle.innerHTML =  str + " Search";
  });
  item.addEventListener('click', function() {
    if (popup.classList.contains('advanced-mode')) {
      all(oneOffItems, function(itm) {
        itm.classList.remove('preselected');
      });
      item.classList.add('preselected');
      searchIcon.classList.remove('yahoo', 'wikipedia', 'twitter', 'ebay', 'amazon');
      searchIcon.classList.add(item.getAttribute('data-engine'));
      searchIcon.style.opacity = 1;
      searchField.focus();
    } else {
      popup.style.display = 'none';
      popup.classList.remove('advanced-mode');
      searchIcon.style.opacity = 0;
      all(oneOffItems, function(item) {
        item.classList.remove('preselected');
      });
      searchField.blur();
    }
  });
});



function updateSuggestions() {
  // update the dummy entry
  suggestions[0].title = searchField.value;
  // typing
  var activeSuggestions = maybe( searchField.value==='', [suggestions[0]], 
                                                         suggestions.filter( function( item ) {
                                                           return item.title.toLowerCase().startsWith( searchField.value.toLowerCase() );
                                                        }));
  if ( activeSuggestions.length < 2 ) {
    activeSuggestions = [{title:''}, {title:searchField.value}];
  }
  var newHTML = "";
  activeSuggestions.forEach( function( item, index ) {
    newHTML += "<li" + maybe(index===0, " class='active'", "") + ">" + item.title + "</li>";
  });
  inject( newHTML, suggestionContainer );

  inject( "Search <strong>"+ searchField.value +"</strong> on:", searchHeadline );

  bindHoverHandlers();
}




function collect(selector) {
  return document.querySelectorAll( selector );
}

function select(selector)  {
  return document.querySelectorAll( selector )[0];
}

function all(collection, fn) {
  if (collection.forEach) {
    collection.forEach(fn);
  } else {
    for (var i=0; i<collection.length; i++) {
      fn(collection[i]);
    }
  }

  return collection;
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