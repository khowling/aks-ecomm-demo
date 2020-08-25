import React, { useState } from 'react'
import { Alert, MyImage } from '../utils/common'
import { _fetchit } from '../utils/fetch.js'
//import { AppInsights } from 'applicationinsights-js'
import { Link } from './router.js'
import { DropdownMenuItemType, Dropdown } from '@fluentui/react/lib/Dropdown'
import { PrimaryButton, MessageBarButton } from '@fluentui/react/lib/Button'
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar'
import { ChoiceGroup } from '@fluentui/react/lib/ChoiceGroup'
import { Label } from '@fluentui/react/lib/Label'
import { Text } from '@fluentui/react/lib/Text'
import { Spinner } from '@fluentui/react/lib/Spinner'
import { Depths } from '@uifabric/fluent-theme/lib/fluent/FluentDepths'
import { mergeStyleSets, getTheme, getFocusStyle } from '@fluentui/react/lib/Styling';
import { List } from '@fluentui/react/lib/List'
import { Image, ImageFit } from '@fluentui/react/lib/Image'
import { FontWeights } from '@uifabric/styling'
import { Card } from '@uifabric/react-cards'
import { Icon } from '@fluentui/react/lib/Icon'
import { Stack, IStackProps } from '@fluentui/react/lib/Stack'
import { /* SharedColors, */ NeutralColors } from '@uifabric/fluent-theme/lib/fluent/FluentColors';
import { Separator } from '@fluentui/react/lib/Separator'
import { Breadcrumb } from '@fluentui/react/lib/Breadcrumb'


const theme = getTheme();

const { palette, semanticColors, fonts } = theme

const classNames = mergeStyleSets({
  itemCell: [
    getFocusStyle(theme, { inset: -1 }),
    {
      minHeight: 54,
      padding: 10,
      boxSizing: 'border-box',
      borderBottom: `1px solid rgb(237, 235, 233)`,
      display: 'flex',
      selectors: {
        '&:hover': { background: " rgb(237, 235, 233)" }
      }
    }
  ],
  itemImage: {
    flexShrink: 0
  },
  itemContent: {
    marginLeft: 20,
    overflow: 'hidden',
    flexGrow: 0,
    width: '80%'
  },
  itemName: [
    fonts.xLarge,
    {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  ],
  itemIndex: {
    fontSize: fonts.small.fontSize,
    color: palette.neutralTertiary,
    marginBottom: 10
  },
  chevron: {
    alignSelf: 'center',
    marginLeft: 20,
    color: palette.neutralTertiary,
    fontSize: fonts.large.fontSize,
    flexShrink: 0
  }
})

function Summary({ cart, checkout }) {
  const [state, setState] = useState({ state: "ready" })
  const [shipping, setShipping] = useState('A')

  function _checkout() {
    setState({ state: "wait" })
    //    AppInsights.trackEvent("Add Order", item, { line_count: 1 })
    _fetchit('PUT', '/api/checkout').then(succ => {
      console.log(`created success : ${JSON.stringify(succ)}`)
      setState({ state: "ordered", response: succ })
      //navTo("ManageOrders")
    }, err => {
      console.error(`created failed : ${err}`)
      setState({ state: "error", description: err })
    })
  }

  return (
    <Stack styles={{ root: { padding: 10, backgroundColor: palette.themeLight } }} tokens={{ childrenGap: 15 }}>

      <Text variant="xLarge">Checkout shopping Cart</Text>
      <Separator />

      <Text variant="mediumPlus" block={true}>
        Subtotal ({cart.items_count || 0} items)  <Text variant="large">£{Array.isArray(cart.items) ? cart.items.reduce((acc, l) => acc + l.line_total, 0) : 0.00}</Text>
      </Text>


      {state.state === 'error' ?
        <MessageBar messageBarType={MessageBarType.error} isMultiline={false} truncated={true} styles={{ root: { maxWidth: "300px" } }}>
          <b>Faild to Checkout, please retry.</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {state.description}</MessageBar>
        : state.state === 'success' ?
          <MessageBar styles={{ root: { maxWidth: "350px" } }} actions={<div>
            <MessageBarButton>Goto Order</MessageBarButton>
          </div>} messageBarType={MessageBarType.success} isMultiline={false}>Order Created</MessageBar>
          :
          <br />
      }


      {checkout ? [
        <Stack.Item>
          <Label block={true}>Delivery Address:</Label>
          <Text style={{ marginLeft: "40px" }} block={true}>999 The Good Street</Text>
          <Text style={{ marginLeft: "40px" }} block={true}>Great Town</Text>
          <Text style={{ marginLeft: "40px" }} block={true}>OneoftheShire</Text>
          <Text style={{ marginLeft: "40px" }} block={true}>PC1 TPC</Text>
        </Stack.Item>,

        <ChoiceGroup style={{ marginTop: "40px" }}
          label="Select Shipping option"
          onChange={(e, i) => setShipping(i.key)}
          defaultSelectedKey={shipping}
          options={[
            { key: 'A', text: 'Within 4 working days (free)' },
            { key: 'B', text: 'Next Day (£9.99)' },
            { key: 'C', text: 'Same Day (not avaiable)', disabled: true }
          ]}

        />,

        <Text style={{ marginTop: "20px" }} variant="large">
          Order Total ({cart.items_count || 0} items)  : £{(shipping === 'B' ? 9.99 : 0) + (Array.isArray(cart.items) ? cart.items.reduce((acc, l) => acc + l.line_total, 0) : 0.00)}
        </Text>,

        <PrimaryButton text="Place Order" onClick={_checkout} allowDisabledFocus disabled={state.state === 'wait' || cart.items_count === 0 || typeof cart.items_count === 'undefined'} />
      ]
        :
        <Stack.Item >
          <Link route="/checkout" className="c-call-to-action c-glyph" style={{ border: 0 }} disabled={state.state === 'wait' || cart.items_count === 0 || typeof cart.items_count === 'undefined'}>Checkout cart</Link>
          <Text variant="small" nowrap={true} block={true} >or</Text>
          <Link route="/" disabled={state.state === 'wait'} className="c-call-to-action c-glyph" style={{ padding: 3, border: 0, color: "#0067b8", background: "transparent" }}><Text >Continue Shopping</Text></Link>
        </Stack.Item>
      }

      {state.state === 'wait' &&
        <Stack.Item >
          <Spinner label="Wait..." ariaLive="assertive" labelPosition="right" />
        </Stack.Item>
      }
    </Stack>
  )
}

export function MyCart({ resource, checkout }) {


  const { status, result } = resource.read()
  const cart = result.data

  function _removeitem(cartline) {
    console.log(cartline)
    _fetchit('PUT', '/api/cartdelete/' + cartline).then(succ => {
      window.location.reload()
      //navTo('/mycart')
    }, err => {
      console.error(`created failed : ${err}`)
      //setState({state: "error", description: `POST ${err}`})
    })
  }

  function _onRenderCell(line, index, isScrolling) {
    console.log(`rendering ${line}`)
    return (
      <div className={classNames.itemCell} data-is-focusable={true}>
        <MyImage image={line.item.image} imageFit={ImageFit.Contain} width={150} />
        <div className={classNames.itemContent}>
          <div className={classNames.itemName}>{line.item.heading}</div>
          <div className={classNames.itemIndex}>{Object.keys(line.options).map(o => <span key={o}>{o} : {line.options[o].text}</span>)}</div>
          <div style={{ marginBottom: 10 }}>{line.item.description}</div>
          <div >
            <div style={{ display: "inline" }}>
              <button onClick={() => _removeitem(line._id)} className="c-button f-lightweight" style={{ minWidth: 0, margin: 0, padding: 0, border: 0 }}>delete</button>

            </div>
          </div>
        </div>
        <div style={{ marginLeft: 30, lineHeight: 2 }}>
          <Dropdown
            selectedKey={line.qty}
            disabled={true}
            //onChange={(e, item) => setOptColor(item)}
            label="Qty"
            options={[
              { key: 1, text: '1' },
              { key: 2, text: "2" },
              { key: 3, text: "3" },
              { key: 4, text: '4', },
              { key: 5, text: "5" },
              { key: 6, text: "6" },
              { key: 7, text: "7" },
              { key: 8, text: "8" },
              { key: 9, text: "9" },
              { key: 10, text: "10" }
            ]}
          //styles={{ dropdown: { width: 300 } }}
          />
          <Text nowrap={true} block={true}>£{line.line_total}</Text>
        </div>
      </div>
    )
  }

  return (
    <Stack>
      <Breadcrumb
        items={[
          { text: 'Home', key: 'home', href: '/' },
          { text: 'My Cart', key: 'cat', href: `/mycart` }]} />

      <Stack horizontal wrap tokens={{ childrenGap: 15 }}>
        <Stack.Item styles={{ root: { width: "700px" } }} grow={1}>
          <List items={cart.items} onRenderCell={_onRenderCell} />
        </Stack.Item>
        <Stack.Item styles={{ root: { width: "300px" } }} grow={1}>
          <Summary cart={cart} checkout={checkout} />
        </Stack.Item>
      </Stack>
    </Stack>
  )
}

export function AddToCart({ resource }) {

  const [optColor, setOptColor] = useState()
  const [state, setState] = useState({ state: "enterdetails" })

  const { status, result } = resource.read()
  const product = result.data
  const category = result.refstores.products.Category[0]

  function addorder() {
    setState({ state: "adding" })
    //    AppInsights.trackEvent("Add Order", item, { line_count: 1 })
    _fetchit('POST', '/api/cartadd', { itemid: product._id, options: { "Colour": optColor } }).then(succ => {
      console.log(`created success : ${JSON.stringify(succ)}`)
      setState({ state: "added", response: succ })
      //navTo("ViewOrder")
    }, err => {
      console.error(`created failed : ${err}`)
      setState({ state: "error", description: err })
    })
  }

  if (status === 'error')
    return <Alert txt={result} />
  else return (
    <Stack>

      <Breadcrumb
        items={[
          { text: 'Home', key: 'home', href: '/' },
          { text: category.heading, key: 'cat', href: `/p/${category._id}` },
          { text: product.heading, key: 'cat', href: `/AddToCart/${product._id}` }]} />

      <Stack horizontal wrap tokens={{ childrenGap: 15 }} >
        <Stack.Item styles={{ root: { background: theme.palette.themeSecondar } }} grow={1}>

          <MyImage imageFit={ImageFit.Contain} styles={{ image: { maxWidth: '100%' } }} image={product.image} />

        </Stack.Item>
        <Stack.Item styles={{ root: { background: theme.palette.themeSecondar, width: '300px' } }} grow={1} >
          <div>
            <strong className="c-badge f-small f-highlight">{product.badge}</strong>
            <h3 className="c-heading">{product.heading}</h3>
            <p className="c-paragraph">{product.description}</p>

            <div className="c-price" itemProp="offers" itemScope="" itemType="https://schema.org/Offer">
              <s><span className="x-screen-reader">Full price was</span>$1,500</s>
              <span>&nbsp;Now</span>
              <meta itemProp="priceCurrency" content="USD" />
              <span>&nbsp;$</span>
              <span itemProp="price">{product.price}</span>
              <link itemProp="availability" href="https://schema.org/InStock" />
            </div>
          </div>
          <br />
          <Dropdown
            selectedKey={optColor ? optColor.key : undefined}
            onChange={(e, item) => setOptColor(item)}
            label="Colour"
            placeholder="Select an option"
            options={[
              { key: 'matalic', text: 'Matalic', itemType: DropdownMenuItemType.Header },
              { key: "silver", text: "Silver" },
              { key: "gold", text: "Gold" },
              { key: 'texture', text: 'Texture', itemType: DropdownMenuItemType.Header },
              { key: "blue", text: "Blue" }
            ]}
            styles={{ dropdown: { width: 300 } }}
          />

          <label className="c-label"></label>
          {state.state === 'enterdetails' ?
            <div className="c-group f-wrap-items" role="group" aria-labelledby="single-select-foo">
              <button className="c-select-button" name="example" role="checkbox" aria-checked="true" data-js-selected-text="choice one has been selected" onClick={addorder}>Add to Cart</button>
            </div>
            : state.state === 'adding' ?
              <div className="c-progress f-indeterminate-local f-progress-small" role="progressbar" aria-valuetext="Loading..." tabIndex="0" aria-label="indeterminate local small progress bar">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>
              : state.state === 'error' ?
                <div className="m-alert f-warning" role="alert">
                  <button className="c-action-trigger c-glyph glyph-cancel" aria-label="Close alert"></button>
                  <div>
                    <div className="c-glyph glyph-warning" aria-label="Warning message"></div>
                    <p className="c-paragraph">{state.description}
                      <span className="c-group">
                        <button className="c-action-trigger" onClick={addorder}>Try Again</button>
                        <Link route="/" className="c-action-trigger">Go Home</Link>
                      </span>
                    </p>
                  </div>
                </div>
                : state.state === 'added' ?
                  <div className="m-alert f-information" role="alert">
                    <button className="c-action-trigger c-glyph glyph-cancel" aria-label="Close alert"></button>
                    <div>
                      <div className="c-glyph glyph-info" aria-label="Information message"></div>
                      <h1 className="c-heading">Items Added</h1>
                      <p className="c-paragraph">Click here to open your Cart
                      <span className="c-group">
                          <Link route="/mycart" className="c-action-trigger" role="button" component="ManageOrders">Cart</Link>

                        </span>
                      </p>
                    </div>
                  </div>
                  : <div></div>
          }

        </Stack.Item>
      </Stack>
    </Stack>

  )
}
