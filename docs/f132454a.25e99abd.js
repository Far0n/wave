(window.webpackJsonp=window.webpackJsonp||[]).push([[229],{283:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return u})),n.d(t,"metadata",(function(){return c})),n.d(t,"rightToc",(function(){return s})),n.d(t,"default",(function(){return p}));var r=n(2),o=n(6),a=(n(0),n(305)),i=n(307),u={title:"Routing / Hash",keywords:["location_hash","routing"]},c={unversionedId:"examples/hash-routing",id:"examples/hash-routing",isDocsHomePage:!1,title:"Routing / Hash",description:"Use the browser's location hash",source:"@site/docs/examples/hash-routing.md",slug:"/examples/hash-routing",permalink:"/wave/docs/examples/hash-routing",editUrl:"https://github.com/h2oai/wave/edit/master/website/docs/examples/hash-routing.md",version:"current",sidebar:"someSidebar",previous:{title:"Routing",permalink:"/wave/docs/examples/routing"},next:{title:"Routing / Toolbar",permalink:"/wave/docs/examples/toolbar-routing"}},s=[],l={rightToc:s};function p(e){var t=e.components,u=Object(o.a)(e,["components"]);return Object(a.b)("wrapper",Object(r.a)({},l,u,{components:t,mdxType:"MDXLayout"}),Object(a.b)("p",null,"Use the browser's ",Object(a.b)("a",Object(r.a)({parentName:"p"},{href:"https://developer.mozilla.org/en-US/docs/Web/API/Location/hash"}),"location hash"),"\nfor routing using URLs."),Object(a.b)("p",null,"The location hash can be accessed using ",Object(a.b)("inlineCode",{parentName:"p"},"q.args['#']"),"."),Object(a.b)("div",{className:"cover",style:{backgroundImage:"url("+n(473).default+")"}}),Object(a.b)("pre",null,Object(a.b)("code",Object(r.a)({parentName:"pre"},{className:"language-py"}),"from h2o_wave import main, app, Q, ui\n\n\n@app('/demo')\nasync def serve(q: Q):\n    hash = q.args['#']\n    if hash:\n        blurb = q.page['blurb']\n        if hash == 'menu/spam':\n            blurb.content = \"Sorry, we're out of spam!\"\n        elif hash == 'menu/ham':\n            blurb.content = \"Sorry, we're out of ham!\"\n        elif hash == 'menu/eggs':\n            blurb.content = \"Sorry, we're out of eggs!\"\n        elif hash == 'about':\n            blurb.content = 'Everything here is gluten-free!'\n    else:\n        q.page['nav'] = ui.markdown_card(\n            box='1 1 4 2',\n            title='Links!',\n            content='[Spam](#menu/spam) / [Ham](#menu/ham) / [Eggs](#menu/eggs) / [About](#about)',\n        )\n        q.page['blurb'] = ui.markdown_card(\n            box='1 3 4 2',\n            title='Store',\n            content='Welcome to our store!',\n        )\n    await q.page.save()\n")),Object(a.b)("p",null,Object(a.b)("strong",{parentName:"p"},"Tags"),": \u2002",Object(a.b)("a",{href:Object(i.a)("docs/examples/tags#location_hash")},"location_hash")," \u2002",Object(a.b)("a",{href:Object(i.a)("docs/examples/tags#routing")},"routing")))}p.isMDXComponent=!0},305:function(e,t,n){"use strict";n.d(t,"a",(function(){return p})),n.d(t,"b",(function(){return m}));var r=n(0),o=n.n(r);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function u(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=o.a.createContext({}),l=function(e){var t=o.a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):u(u({},t),e)),n},p=function(e){var t=l(e.components);return o.a.createElement(s.Provider,{value:t},e.children)},b={inlineCode:"code",wrapper:function(e){var t=e.children;return o.a.createElement(o.a.Fragment,{},t)}},f=o.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,i=e.parentName,s=c(e,["components","mdxType","originalType","parentName"]),p=l(n),f=r,m=p["".concat(i,".").concat(f)]||p[f]||b[f]||a;return n?o.a.createElement(m,u(u({ref:t},s),{},{components:n})):o.a.createElement(m,u({ref:t},s))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,i=new Array(a);i[0]=f;var u={};for(var c in t)hasOwnProperty.call(t,c)&&(u[c]=t[c]);u.originalType=e,u.mdxType="string"==typeof e?e:r,i[1]=u;for(var s=2;s<a;s++)i[s]=n[s];return o.a.createElement.apply(null,i)}return o.a.createElement.apply(null,n)}f.displayName="MDXCreateElement"},306:function(e,t,n){"use strict";var r=n(0),o=n(19);t.a=function(){var e=Object(r.useContext)(o.a);if(null===e)throw new Error("Docusaurus context not provided");return e}},307:function(e,t,n){"use strict";n.d(t,"b",(function(){return a})),n.d(t,"a",(function(){return i}));var r=n(306),o=n(308);function a(){var e=Object(r.a)().siteConfig,t=(e=void 0===e?{}:e).baseUrl,n=void 0===t?"/":t,a=e.url;return{withBaseUrl:function(e,t){return function(e,t,n,r){var a=void 0===r?{}:r,i=a.forcePrependBaseUrl,u=void 0!==i&&i,c=a.absolute,s=void 0!==c&&c;if(!n)return n;if(n.startsWith("#"))return n;if(Object(o.b)(n))return n;if(u)return t+n;var l=n.startsWith(t)?n:t+n.replace(/^\//,"");return s?e+l:l}(a,n,e,t)}}}function i(e,t){return void 0===t&&(t={}),(0,a().withBaseUrl)(e,t)}},308:function(e,t,n){"use strict";function r(e){return!0===/^(\w*:|\/\/)/.test(e)}function o(e){return void 0!==e&&!r(e)}n.d(t,"b",(function(){return r})),n.d(t,"a",(function(){return o}))},473:function(e,t,n){"use strict";n.r(t),t.default=n.p+"assets/images/hash-routing-816838345c1b3e01e3fe1664c336f3d6.png"}}]);