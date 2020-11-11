import React, { useState, } from 'react'
import { Link } from './router.js'
import { EditImage } from '../utils/common'
import { _fetchit /*, _suspenseFetch, _suspenseWrap */ } from '../utils/fetch'

import { Card } from '@uifabric/react-cards'
import { Text, Image, ImageFit, TextField, Stack, PrimaryButton, Label, Checkbox, Spinner } from '@fluentui/react'



export function StartBusiness() {

  const [input, handleInputChange] = useState({
    'name': '',
    'email': '',
    'image': { url: 'https://assets.onestore.ms/cdnfiles/onestorerolling-1511-11008/shell/v3/images/logo/microsoft.png' },
    'catalog': null,
    'inventory': false
  })
  const [validation, setValidation] = useState({
    'name': 'Required',
    'email': 'Required',
    'catalog': 'Required'
  })
  const [state, setState] = useState({ state: 'reset', description: '' })

  function _onChange(e, val) {
    handleInputChange({ ...input, [e.target.name]: val })

    if (e.target.name === "email") {
      setValidation({ ...validation, [e.target.name]: /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(val) ? false : 'needs to be email format' })
    } else if (e.target.name === "name") {
      setValidation({ ...validation, [e.target.name]: !val ? 'Required' : null })
    } else if (e.target.name === "catalog") {
      setValidation({ ...validation, [e.target.name]: !val ? 'Required' : null })
    }
  }

  function _createBusiness(a) {
    setState({ state: 'resetting' })
    _fetchit(`/api/createtenent`, 'POST', {}, input).then(succ => {
      console.log(`created success : ${JSON.stringify(succ)}`)
      setState({ state: 'success' })

    }, err => {
      console.error(`created failed : ${err}`)
      setState({ state: 'error', description: err })
    })
  }

  return (
    <Stack horizontal wrap tokens={{ childrenGap: 30, padding: 'l2' }}>

      <Stack styles={{ root: { width: "45%" } }} tokens={{ childrenGap: 30 }}>
        <Text variant="xxLarge"  >Build a retail business like a BOSS</Text>
        <Text variant="large">Create your product catalogue, assign a Warehouse, build Inventory, and open your online business</Text>

        <Stack.Item>
          <Text variant="large" >Create a tenent for your business:</Text>
        </Stack.Item>
        <Stack.Item>
          <TextField required label="Store Name" name="name" value={input.name} onChange={_onChange} errorMessage={validation.name} />
          <TextField required label="Store Admin email (not validated)" name="email" value={input.email} onChange={_onChange} errorMessage={validation.email} />
        </Stack.Item>

        <Stack.Item>

          <Label>Store Logo (on nav bar)</Label>
          <EditImage result_image={input.image} onChange={_onChange} />

        </Stack.Item>
        <Stack.Item>
          <Label >Choose your product catalogue:</Label>
        </Stack.Item>
        <Stack.Item>
          <Stack horizontal tokens={{ childrenGap: 30 }}>

            <Card
              aria-label="Clickable vertical card with image bleeding at the top of the card"
              onClick={() => _onChange({ target: { name: "catalog" } }, "bike")}
              tokens={{ childrenMargin: 12, boxShadowFocused: 'red' }}
              styles={input.catalog === 'bike' ? { root: { border: '1px solid red' } } : {}}
            >
              <Card.Item>
                <TextField disabled value="https://khcommon.z6.web.core.windows.net/az-device-shop/setup/bikes.json" />
              </Card.Item>
              <Card.Item styles={{ root: { height: "160px" } }}>
                <Image imageFit={ImageFit.centerContain} styles={{ root: { height: "100%" } }} src="https://freesvg.org/img/clipartjunky218-Cyclist-on-Bike.png" />
              </Card.Item>
              <Card.Section>
                <Label >Getting started cycling product calalogue</Label>
              </Card.Section>

              <Card.Section horizontal tokens={{ childrenGap: 10 }}>
                <Text>12 products</Text>
                <Text>3 categories</Text>
                <Text>3 Declined</Text>
              </Card.Section>

              <Card.Section>
                <Checkbox label="Create Inventry Workorders" value={input.inventory} onChange={(e, v) => _onChange({ target: { name: "inventory" } }, v)} />
              </Card.Section>

            </Card>

            <Card
              aria-label="Clickable vertical card with image bleeding at the top of the card"
              onClick={() => _onChange({ target: { name: "catalog" } }, "none")}
              tokens={{ childrenMargin: 12 }}
              styles={input.catalog === 'none' ? { root: { border: '1px solid red' } } : {}}
            >
              <Card.Item>
                <TextField disabled />
              </Card.Item>
              <Card.Item styles={{ root: { height: "160px" } }}>
                <Image imageFit={ImageFit.centerContain} styles={{ root: { height: "100%" } }} src="https://placehold.it/160x160?text=none" />
              </Card.Item>

              <Card.Section>
                <Label>I will create my own categories/products</Label>
              </Card.Section>

              <Card.Item grow={1}>
                <span />
              </Card.Item>
              <Card.Section horizontal tokens={{ childrenGap: 10 }}>
                <Text>0 products</Text>
                <Text>0 categories</Text>
                <Text>0 Declined</Text>
              </Card.Section>
              <Card.Section>
                <Checkbox label="Create Inventry Workorders" disabled={true} />
              </Card.Section>

            </Card>
          </Stack>

        </Stack.Item>

        <Stack.Item>
          {state.state === 'reset' ?
            <PrimaryButton text={`Initialise My Business`} onClick={_createBusiness} allowDisabledFocus disabled={Object.entries(validation).reduce((a, c) => a || c[1], null)} />
            : state.state === 'resetting' ?
              <Spinner label="Please Wait, will take a few seonds..." ariaLive="assertive" labelPosition="right" />
              : state.state === 'error' ?
                <div className="m-alert f-warning" role="alert">
                  <button className="c-action-trigger c-glyph glyph-cancel" aria-label="Close alert"></button>
                  <div>
                    <div className="c-glyph glyph-warning" aria-label="Warning message"></div>
                    <p className="c-paragraph">{state.description}
                      <span className="c-group">
                        <button className="c-action-trigger" onClick={() => setState({ state: 'reset' })}>Try Again</button>

                      </span>
                    </p>
                  </div>
                </div>
                : state.state === 'success' ?
                  <div className="m-alert f-information" role="alert">
                    <button className="c-action-trigger c-glyph glyph-cancel" aria-label="Close alert"></button>
                    <div>
                      <div className="c-glyph glyph-info" aria-label="Information message"></div>
                      <h1 className="c-heading">Done</h1>
                      <p className="c-paragraph">Click here to open your Store
                      <span className="c-group">
                          <Link route="/" className="c-action-trigger" role="button" component="ManageOrders">Store</Link>

                        </span>
                      </p>
                    </div>
                  </div>
                  : <div></div>
          }

        </Stack.Item>
      </Stack>

      <Stack styles={{ root: { width: "45%" } }}>
        <Image src="https://3er1viui9wo30pkxh1v2nh4w-wpengine.netdna-ssl.com/wp-content/uploads/2014/09/Satya_smiling-print-1024x683.jpg" />
      </Stack>

    </Stack>
  )
}