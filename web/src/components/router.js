import React, { useState, useEffect, useContext /*, Suspense */ } from 'react'
import { _suspenseFetch, _suspenseWrap } from '../utils/fetch'
import { RenderContext } from '../GlobalContexts'

import { Spinner, SpinnerSize } from '@fluentui/react';

// Used by Link & NavTo
export function _encodeURL(route, urlid, props) {
  let ulrstr = route ? route : (urlid ? "/_" : "/")
  ulrstr += urlid ? ("/" + urlid) : ""

  if (props && Object.keys(props).length > 0) ulrstr += "?props=" + encodeURIComponent(btoa(JSON.stringify(props)));
  return ulrstr;
}

// =====================================     Processes navigation routes Called from DOM 
export function Link({ route, urlid, props, children, ...rest }) {
  const { ssrContext } = useContext(RenderContext)

  function handleClick(event) {
    //console.log ('Link: handleclick')

    if (
      !event.defaultPrevented && // onClick prevented default
      event.button === 0 && // ignore everything but left clicks
      !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) && // ignore clicks with modifier keys
      ssrContext === "spa" // Only override links if not SSR
    ) {
      console.log('Link: first, window.history.pushState, then listener will call setRenderRoute re-render Router')
      event.preventDefault()

      // if Link has onClink - call it first
      if (rest.onClick) rest.onClick()


      // (1) Update the browser URL (this does no page-reloading)
      if (typeof window !== 'undefined') {
        window.history.pushState("", "", event.currentTarget.href)
      }
      // (2) Now notify the router!!
      listeners.forEach(listener => listener({ routekey: route || '/', urlid, props }))
    }

  }

  return (<a {...rest} onClick={handleClick} href={_encodeURL(route, urlid, props)}> { children}</a >)
}

export function Redirect({ route, urlid, props }) {


  useEffect(() => {

    let redirect = true
    // (1) Update the browser URL
    if (typeof window !== 'undefined') {
      const { routekey /*, props, urlid */ } = pathToRoute(new URL(window.location))
      if (routekey === route) {
        redirect = false
      }

      if (redirect) {
        window.history.replaceState("", "", _encodeURL(route, urlid, props))
      }
    }

    if (redirect) {
      // (2) Now notify the router!!
      listeners.forEach(listener => listener({ routekey: route || '/', urlid, props }))
    }
  }, [props, urlid, route])

  return null
}

// =====================================     Processes navigation routes Called from React JS 
export function navTo(route, urlid, props) {
  console.log('navTo: first, window.history.pushState,  then listener will call setRenderRoute re-render Router')
  // (1) Update the browser URL
  if (typeof window !== 'undefined') {
    window.history.pushState("", "", _encodeURL(route, urlid, props))
  }
  //const routeJson = getRouteObj(route, recordid, props)
  listeners.forEach(listener => listener({ routekey: route || '/', urlid, props }))
}

// convert parts of the url into route key, recordid and props
export function pathToRoute({ pathname, search, hash }) {
  console.log(`pathToRoute pathname=${pathname} search=${search}`)
  const propsparam = search && search.match(/A?props=([^&]+)&*/i),
    url_props = propsparam ? propsparam[1] : null,
    withoutleadingslash = pathname.slice(1),
    [url_comp = '/', urlid] = withoutleadingslash.split("/", 2)

  return {
    routekey: '/' + (url_comp ? (url_comp === "_" ? '' : url_comp) : ''),
    props: url_props ? JSON.parse(atob(decodeURIComponent(url_props))) : {},
    urlid,
  }
}

const listeners = [];
// =====================================     My Super Simple Router 
// Params: cfg = routing configration (AppRouteCfg)
export function Router({ startUrl, cfg }) {
  console.log(`Render Router, startUrl=${JSON.stringify(startUrl)}`)
  // renderRoute : route that needs to be rendered (default is the startURL)
  const [renderRoute, setRenderRoute] = useState(pathToRoute(startUrl))
  const { ssrContext, serverInitialData } = useContext(RenderContext)



  // Subscribe to <Link> & navTo events
  useEffect(() => {
    if (ssrContext === "spa") {
      //console.log('useRouter: useEffect - initialise listeners to call setRenderRoute on <Link> & navTo()')
      listeners.push(newrouteRequested => setRenderRoute(newrouteRequested))
      return () => listeners.pop()
    }
  }, [ssrContext])

  // Subscribe to popstate events (browser back/forward buttons)
  useEffect(() => {
    function chnRouteFn(event) {
      setRenderRoute(() => {
        const { pathname, search, hash } = new URL(window.location)
        console.log(`useRouter:useEffect calling pathToRoute with window url`)
        return pathToRoute({ pathname, search, hash })
      })
    }

    if (typeof window !== 'undefined' && ssrContext === "spa") {
      //console.log ('useRouter: useEffect - initialise listeners to listen for popstate (browser back/forward)')
      window.addEventListener('popstate', chnRouteFn, false)
      return () => { window.removeEventListener('popstate', chnRouteFn, false) }
    }
  }, [ssrContext])

  // return child components
  const { component, componentFetch, routeProps = {}, requireAuth } = cfg[renderRoute.routekey] || {}

  console.log(`Render useRouter,  ssrContext=${ssrContext} routekey=${renderRoute.routekey}`)
  if (!component) {
    console.error(`useRouter()  error, unknown route ${renderRoute.routekey}`)
    return `404 - error, unknown route ${renderRoute.routekey}`
  } else {
    let resource
    if (componentFetch) {
      if (ssrContext === "server") {
        // the data has been fetched on the server, so just wrap in a completed Promise
        resource = _suspenseWrap(serverInitialData)
      } else {

        //console.log(`Start the data fetch for the route`)

        if (requireAuth) {
          // TODO - router does have access to session data
        }
        resource = _suspenseFetch('componentFetch' + renderRoute.routekey, renderRoute.urlid)

      }
      //console.log(`useRouter() wrapped suspense createElement`)
      return (
        <React.Suspense fallback={<Spinner size={SpinnerSize.large} styles={{ root: { marginTop: "100px" } }} label="Please Wait..." ariaLive="assertive" labelPosition="right" />}>
          { React.createElement(component, Object.assign({ key: renderRoute.routekey }, routeProps, renderRoute.props, { resource }))}
        </React.Suspense>
      )
    } else {
      //console.log(`useRouter() no componentFetch, createElement`)
      return React.createElement(component, Object.assign({ key: renderRoute.routekey }, routeProps, renderRoute.props))
    }

  }
}
