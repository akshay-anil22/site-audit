import * as Headless from '@headlessui/react'
import { Link as RouterLink } from 'react-router-dom'
import React, { forwardRef } from 'react'

export const Link = forwardRef(function Link(props, ref) {
  // Map Catalyst's 'href' prop to React Router's 'to' prop
  const destination = props.href || props.to;

  return (
    <Headless.DataInteractive>
      <RouterLink {...props} to={destination} ref={ref} />
    </Headless.DataInteractive>
  )
})