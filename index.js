function isScrollingSpaceEvent(event) {
  const keyIsSpace = (event.key === ' ');
  const eventComesFromInput = (event.target.nodeName.match(/input|textarea|select/i) || event.target.hasAttribute('contenteditable'));
  return (keyIsSpace && !eventComesFromInput);
}

function cantScrollFurther(scrollingElement) {
  const scrollHeight = scrollingElement.scrollHeight;
  const viewportHeight = scrollingElement.clientHeight;
  const lowestVisibleOffset = scrollingElement.scrollTop + viewportHeight;
  
  const pageIsScrollable = (viewportHeight < scrollHeight);
  const cantScrollFurther = (lowestVisibleOffset === scrollHeight);
  return (pageIsScrollable && cantScrollFurther);
}

function getNextHRefFromLink(link) {
  const linkIsNext = (link.rel.match(/next/i));
  const linkHasHRef = !!link.href;
  if (linkIsNext && linkHasHRef) {
    return link.href;
  }
  return null;
}

function getNextHRefFromDocument(document) {
  const links = [...document.getElementsByTagName('link'), ...document.links];
  const nextHRefs = links.map(getNextHRefFromLink).filter(Boolean);
  return nextHRefs[0];
}

function goToNextHRef() {
  const nextHRef = getNextHRefFromDocument(document);
  if (nextHRef) {
    window.location = nextHRef;
  }
}

document.addEventListener('keypress', function(event) {
  if (isScrollingSpaceEvent(event) && cantScrollFurther(document.scrollingElement)) {
    goToNextHRef();
  }
}, false);
