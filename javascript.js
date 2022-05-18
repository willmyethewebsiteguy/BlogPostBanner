/* ==========
  Version 3.0.9 Updating a Release 3
  Blog Banner Styles Plugin for Squarespace
  Copyright Will Myers 
========== */
(function(){
  let $configEl = $('[data-wm-plugin="blog-post"]');

  function initBlogBanner() {
      let cssFile = 'https://cdn.jsdelivr.net/gh/willmyethewebsiteguy/BlogPostBanner@3.1.005/styles.min.css';
      addCSSFileToHeader(cssFile);
      function addCSSFileToHeader(url){
        let head = document.getElementsByTagName('head')[0],
            link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        head.appendChild(link);
      }
    //Config Styles
    let style =
        $configEl.attr("data-post-style") == undefined
    ? "1"
    : $configEl.attr("data-post-style"),
        headerTheme =
        $configEl.attr("data-theme") == undefined
    ? "black"
    : $configEl.attr("data-theme"),
        opacity =
        $configEl.attr("data-opacity") == undefined
    ? "0"
    : $configEl.attr("data-opacity"),
        imgSrc =
        $configEl.attr("data-img-src") == undefined
    ? "thumbnail"
    : $configEl.attr("data-img-src"),
        baseUrl = location.protocol + "//" + location.host + location.pathname,
        $section =
        document.querySelector(
          "#sections > .page-section.content-collection"
        ) ||
        document.querySelector("main.Main--blog-item") ||
        document.querySelector("main.Main--events-item"),
        $sectionBackground =
        $section.querySelector(".section-background") ||
        document.createElement("section"),
        $sectionContent =
        $section.querySelector(".content-wrapper") ||
        $section.querySelector("section.Main-content"),
        $title =
        $sectionContent.querySelector(".blog-item-top-wrapper") ||
        $sectionContent.querySelector(".eventitem-column-meta") ||
        document.createElement("div"),
        $titleClone = $title.cloneNode(true),
        body = document.querySelector("body");

    //Get JSON Post Data
    let postData;
    
    $.getJSON(baseUrl + "/?format=json-pretty", {_: new Date().getTime()} ,function (data) {
      postData = data;
      let posX = data.item.mediaFocalPoint.x * 100 + "%",
          posY = data.item.mediaFocalPoint.y * 100 + "%",
          focalPoint = posX + " " + posY;
      body.style.setProperty("--image-focal-point", focalPoint);
      if (imgSrc == "thumbnail") {
        imgSrc = postData.item.assetUrl;
        buildImage();
      }
    });


    //If 7.0 Website
    if (window.Static.SQUARESPACE_CONTEXT.templateVersion == "7") {
      document.querySelector("body").classList.add("sqs-seven");
      $sectionBackground.classList.add("Index-page--has-image");
      let main = document.querySelector("main.Main--blog-item");
      $titleClone.classList.add("blog-item-top-wrapper", "clone");
      //Add in Section
      
      $section.prepend($sectionBackground);
      //Add Title Clone Content
      try {
        let title =
            document.querySelector(".BlogItem-title").cloneNode(true) ||
            document.querySelector(".eventitem-title").cloneNode(true);
        $titleClone.append(title);
      } catch (err) {
        console.log("No Title");
      }
      try {
        let meta =
            document.querySelector(".BlogItem-meta").cloneNode(true) ||
            document
        .querySelector(".event-meta-date-time-container")
        .cloneNode(true);
        $titleClone.append(meta);
      } catch (err) {
        console.log("No Meta");
      }
      try {
        let share =
            document.querySelector(".BlogItem-share").cloneNode(true) ||
            document
        .querySelector(".event-meta event-meta-addtocalendar-container")
        .cloneNode(true);
        $titleClone.append(share);
      } catch (err) {
        console.log("No Share");
      }
    }

    body.classList.add("wm-banner-style-" + style);
    $section.classList.add("has-banner");
    $sectionBackground.classList.add("wm-blog-banner");
    $titleClone.classList.add("clone");
    if ($titleClone.querySelector('[itemprop="headline"]')) {
      $titleClone.querySelector('[itemprop="headline"]')
        .removeAttribute('itemprop');
    }
    if ($titleClone.querySelector('[data-content-field="title"]')) {
      $titleClone.querySelector('[data-content-field="title"]')
        .removeAttribute('data-content-field');
    }



    //Build Section Background
    let overlay = document.createElement("div"),
        sectionBackgroundImg = document.createElement("div"),
        sectionBackgroundContent = document.createElement("div");
    overlay.classList.add("section-background-overlay");
    sectionBackgroundImg.classList.add("section-background-image");
    sectionBackgroundContent.classList.add(
      "section-background-content",
      "blog-item-wrapper"
    );
    if (imgSrc !== 'thumbnail') {
      buildImage() 
    }

    sectionBackgroundImg.append(overlay);
    $sectionBackground.append(sectionBackgroundImg);
    $sectionBackground.append(sectionBackgroundContent);

    //Add in Title
    sectionBackgroundContent.append($titleClone);

    //Make Content Background Same Color on 7.1
    let backgroundColor = window
    .getComputedStyle($sectionBackground)
    .getPropertyValue("background-color");
    if (window.Static.SQUARESPACE_CONTEXT.templateVersion !== "7") {
      body.style.setProperty("--section-background-color", backgroundColor);
    }

    function buildImage() {
      let img = document.createElement("img") ;
      img.setAttribute("data-src", imgSrc);
      img.src = imgSrc;
      sectionBackgroundImg.append(img);
    }

    //Set Content Width Variable
    if (window.Static.SQUARESPACE_CONTEXT.templateVersion !== "7") {
      try {
        let sectionWidth = findSectionWidth();
        body.style.setProperty("--section-content-width", sectionWidth);
      } catch (err) {
        console.log(err);
      }
    }

    if (window.Static.SQUARESPACE_CONTEXT.templateVersion == "7") {
      document.addEventListener('DOMContentLoaded', function() {
        loadAllImages();
      })
    }

    //Add Class After Work Is Complete
    body.classList.add("tweak-wm-banner");
  }

  /*======= FUNCTIONS =========*/
  /*If In Edit Mode*/
  function watchEditMode() {
    const targetNode = document.querySelector("body");
    const config = {
      attributes: true,
      childList: false,
      subtree: false,
      attributeFilter: ["class"],
    };
    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(ifInEditMode).observe(
      targetNode,
      config
    );
    // Callback function to execute when mutations are observed
    function ifInEditMode(mutationList, observer) {
      // Use traditional 'for loops' for IE 11
      if (targetNode.classList.contains("sqs-layout-editing")) {
        $('link[href*="WMBlogPostBanner"]').attr("disabled", "disabled");
        $(".wm-blog-banner .section-background-image").hide();
        $(".wm-blog-banner .section-background-content").hide();
      } else {
        $('link[href*="WMBlogPostBanner"]').removeAttr("disabled");
        $(".wm-blog-banner .section-background-image").show();
        $(".wm-blog-banner .section-background-content").show();
      }
    }
  }

  /*Find Section Width in 7.1*/
  let findSectionWidth = () => {
    let width,
        tweakJSONWidth =
        window.Static.SQUARESPACE_CONTEXT.tweakJSON["tweak-blog-item-width"];
    if (tweakJSONWidth == "Narrow") {
      width = "50%";
    } else if (tweakJSONWidth == "Medium") {
      width = "75%";
    } else if (tweakJSONWidth == "Wide") {
      width = "100%";
    } else if (tweakJSONWidth == "Custom") {
      width =
        window.Static.SQUARESPACE_CONTEXT.tweakJSON[
        "tweak-blog-item-custom-width"
      ] + "%";
    }
    return width;
  };

  /* Get Image Aspect Ratio in 7.1 */
  let getImageAspect = () => {
    let aspectRatio,
        el = document.querySelector(".section-background-image img"),
        imgDimen = [];
    imgDimen[0] = el.getAttribute("data-image-dimensions").split("x")[0];
    imgDimen[1] = el.getAttribute("data-image-dimensions").split("x")[1];
    aspectRatio = (imgDimen[1] / imgDimen[0]) * 100 + "%";
    return aspectRatio;
  };

  /* Load Images */
  let loadAllImages = () => {
    try {
      var images = document.querySelectorAll("img[data-src]");
      for (var i = 0; i < images.length; i++) {
        ImageLoader.load(images[i], { load: true });
      }
    } catch (err) {
      console.log(err)
    }
  };

  /* init 7.1 */
  if (window.Static.SQUARESPACE_CONTEXT.templateVersion !== "7") {
    let active = !!$configEl.not('[data-no-edit-mode]').length || (window.self == window.top);
      if($configEl.length && active){
        initBlogBanner();
        if (window.self !== window.top){
          watchEditMode();
        }
      }
  } else {
    window.Squarespace.onInitialize(Y, function(){
      $configEl = $('[data-wm-plugin="blog-post"]');
      if($configEl.length){
        initBlogBanner();
       setTimeout(function(){
          Y.config.win.Squarespace.initializeLayoutBlocks(Y)
        }, 500)
        if (window.self !== window.top){
          watchEditMode();
        }
      }
    });
  }
}());

/*Global Vars*/
//Set Header Height & Bottom Pos
let wM = window.wM || {};
(function(){
  let version = 1.0;
  if (document.getElementById('header')){
    wM.header = wM.header || {};
    wM.header.version = typeof wM.header.version == 'undefined' ? version : (wM.header.version < version ? version : wM.header.version);
    if (wM.header.version == version){
      initHeaderLogic();
    }
  }

  function initHeaderLogic(){
    let headerObj = wM.header;
    let $header = document.getElementById('header');
    let root = document.documentElement;
    headerObj.headerElem = $header;

    headerObj.setHeaderCSS = function setHeight(){
      headerObj.headerBottom = headerObj.headerElem.getBoundingClientRect().bottom;
      headerObj.headerBottom =  headerObj.headerBottom < 0 ? 0 : headerObj.headerBottom;
      headerObj.headerHeight = headerObj.headerElem.getBoundingClientRect().height;
      root.style.setProperty('--wM-headerBottom', headerObj.headerBottom + 'px');
      root.style.setProperty('--wM-headerHeight', headerObj.headerHeight + 'px');
    }
    headerObj.setHeaderCSS();

    headerObj.headerElem.addEventListener('transitionend', () => {
      headerObj.setHeaderCSS();
    });
    window.addEventListener('scroll', () => {
      setTimeout(function(){
        headerObj.setHeaderCSS();
      }, 150);
    });
    window.addEventListener('resize', () => {
      setTimeout(function(){
        headerObj.setHeaderCSS();
      }, 150);
    });
  }
}());