import React from 'react'
import classes from './App.module.css'

import { Navigation } from './components'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { Home, Users, CreateRoles, ListRoles, Settings } from './pages'


const MyApp = () => (
    <BrowserRouter
    >
        <div className={classes.container}>
            <div className={classes.left}>
                <Navigation />
            </div>

            <div className={classes.right}>
                <Switch>
                    <Route
                        exact
                        path="/"
                        component={Home}
                    />

                    <Route
                        exact
                        path="/users"
                        component={Users}
                    />

                    <Route
                        exact
                        path="/roles/list"
                        component={ListRoles}
                    />

                    <Route
                        exact
                        path="/roles/create"
                        component={CreateRoles}
                    />

                    <Route
                        exact
                        path="/roles/edit/:roleId"
                        component={CreateRoles}
                    />

                    <Route
                        exact
                        path="/settings"
                        component={Settings}
                    />
                </Switch>
            </div>
        </div>
    </BrowserRouter>
)

export default MyApp
