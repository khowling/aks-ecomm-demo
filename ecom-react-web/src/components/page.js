import React, {useContext} from 'react'
import { Link } from './router.js'

import RenderContext from '../RenderContext'

export function Nav ({user}) {
  const {auth} = useContext(RenderContext)
  return (
    <nav className="m-navigation-bar" role="navigation">

      <div className="c-navigation-menu">

        <Link className="navbar-brand no-outline">
            <img src="https://assets.onestore.ms/cdnfiles/onestorerolling-1511-11008/shell/v3/images/logo/microsoft.png" alt="Microsoft" height="23"/>
        </Link>

        <button aria-controls="navigationMenuA" aria-haspopup="true" aria-expanded="false">Navigation menu</button>
        <ul id="navigationMenuA" aria-hidden="true">
            <li className="f-sub-menu">
                <button aria-controls="navigationMenuAMenu1" aria-haspopup="true" aria-expanded="false">Sub menu 1</button>
                <ul id="navigationMenuAMenu1" aria-hidden="true">
                    <li>
                        <a href="#/">Hyperlink 1</a>
                    </li>
                </ul>
            </li>
            <li>
                <a href="#/">Hyperlink 1</a>
            </li>
        </ul>
        

        <form className="c-search" autocomplete="off" name="form1" target="_self" style={{left:"30%", "min-width": "250px", "display": "inline-block", "horizontal-align": "middle", "vertical-align": "middle", "margin-top": "0"}}>
          <input aria-label="Enter your search" type="search" name="search-field" placeholder="Search" />
          <button className="c-glyph" name="search-button">
              <span className="x-screen-reader">Search</span>
          </button>
        </form>
        </div>
        <Link route="/cart" className="c-call-to-action c-glyph" style={{position: "absolute", right: "0", padding: "11px 12px 13px", border: "2px solid transparent", color: "#0067b8", background: "transparent"}}>
          <span>Cart items</span>
        </Link>
        { !auth.loggedon ? 
          <a href="/connect/microsoft" className="c-call-to-action c-glyph" style={{position: "absolute", right: "0", padding: "11px 12px 13px", border: "2px solid transparent", color: "#0067b8", background: "transparent"}}>
            <span>Login</span>
          </a>
        :
        <Link  className="c-call-to-action c-glyph" style={{position: "absolute", right: "0", padding: "11px 12px 13px", border: "2px solid transparent", color: "#0067b8", background: "transparent"}}>
          <span>{auth.given_name}</span>
        </Link>
        }
        
    </nav>
  )
}