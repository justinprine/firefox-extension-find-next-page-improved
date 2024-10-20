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
  if (!pageIsScrollable) {
    return true;
  }
  const roundingError = 2;
  return (lowestVisibleOffset + roundingError >= scrollHeight);
}

function getNextHRefFromLink(link) {
  const linkIsNext = (/next/i.test(link.rel));
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

function extractPageNumberFromURL(url) {
  // Check for URL parameter pattern e.g. ?page=1
  const paramMatch = url.match(/page=(\d+)/);
  if (paramMatch) {
    return parseInt(paramMatch[1], 10);
  }

  // Check for URL path pattern e.g. /page/1/
  const pathMatch = url.match(/\/page\/(\d+)/);
  if (pathMatch) {
    return parseInt(pathMatch[1], 10);
  }

  // No page number found
  return null;
}

function generateNextPageURL(url) {
  const currentPage = extractPageNumberFromURL(url);

  if (currentPage !== null) {
    // Increment the page number to generate the next page URL
    const nextPage = currentPage + 1;

    // Handle URL parameter pattern
    if (url.includes('page=')) {
      return url.replace(/(page=)(\d+)/, `$1${nextPage}`);
    }

    // Handle URL path pattern
    if (url.includes('/page/')) {
      return url.replace(/(\/page\/)(\d+)/, `$1${nextPage}`);
    }
  }

  // If no valid page number could be determined, return null
  return null;
}

// Checks links in the page to guess the page URL format (e.g., ?page=1 or /page/1)
function guessNextPageURLFromLinks() {
  const links = document.links;
  
  for (const link of links) {
    const href = link.href;
    
    // Try to find a link that has a page parameter (e.g., ?page=1)
    const paramMatch = href.match(/page=(\d+)/);
    if (paramMatch) {
      // Construct the URL for page 2 based on the format found
      return href.replace(/(page=)(\d+)/, '$12');
    }

    // Try to find a link that has a page in the path (e.g., /page/1/)
    const pathMatch = href.match(/\/page\/(\d+)/);
    if (pathMatch) {
      // Construct the URL for page 2 based on the format found
      return href.replace(/(\/page\/)(\d+)/, '$12');
    }
  }

  // No relevant link found
  return null;
}

function goToNextHRef() {
  const nextHRef = getNextHRefFromDocument(document);

  if (nextHRef) {
    window.location = nextHRef;
  } else {
    // No "next" link found, attempt to generate the next page URL from the current URL
    const currentURL = window.location.href;
    const nextPageURL = generateNextPageURL(currentURL);

    if (nextPageURL) {
      window.location = nextPageURL;
    } else {
      // No URL generated from the current URL, attempt to guess based on links in the page
      const guessedNextPageURL = guessNextPageURLFromLinks();
      if (guessedNextPageURL) {
        window.location = guessedNextPageURL;
      }
      // If no nextPageURL is generated, do nothing
    }
  }
}

document.addEventListener('keypress', function (event) {
  if (isScrollingSpaceEvent(event) && cantScrollFurther(document.scrollingElement)) {
    goToNextHRef();
  }
}, false);
