import { Menu, MenuItem } from '@dhis2/ui'
import { useHistory, useRouteMatch } from 'react-router-dom'
import { PropTypes } from '@dhis2/prop-types'
import React from 'react'

const NavigationItem = ({ path, label }) => {
    // browser history object
    const history = useHistory()

    // "null" when not active, "object" when active
    const routeMatch = useRouteMatch(path)
    // If "isActive" is not null and "isActive.isExact" is true
    const isActive = routeMatch?.isExact

    // Callback called when clicking on the menu item.
    // If the menu item is not active, navigate to the path
    const onClick = () => !isActive && history.push(path)

    return <MenuItem label={label} active={isActive} onClick={onClick} />
}

NavigationItem.propTypes = {
    label: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
}

export const Navigation = () => (
    <Menu>
        <NavigationItem
            label="Home"
            path="/"
        />

        <NavigationItem
            label="Users"
            path="/users"
        />
        <NavigationItem
            label="Roles"
            path="/roles/list"
        />

        <NavigationItem
            label="Settings"
            path="/settings"
        />
    </Menu>
)