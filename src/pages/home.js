import React, { useState } from 'react'
import {
    Table, TableHead, TableRowHead, TableCellHead,
    TableBody, TableRow, TableCell, CircularLoader, CenteredContent,
    FlyoutMenu, MenuItem, DropdownButton, Modal, ModalContent,
    ModalActions, ModalTitle, ButtonStrip, Button, Card
} from '@dhis2/ui'
import { Link } from 'react-router-dom'
import styles from './Form.module.css'


import { useDataQuery, useDataMutation } from '@dhis2/app-runtime'


const dataStoreQuery = {
    results: {
        resource: "dataStore/userMan/userRoles",
    }
}

const dataStoreMutation = {
    resource: 'dataStore/userMan/userRoles',
    type: 'create',
    data: {
        userRoles: []
    }
}

const dataStoreMutationSettings = {
    resource: 'dataStore/userMan/settings',
    type: 'create',
    data: {
        settings: {}
    }
}


export const Home = () => {

    const { loading, error, data } = useDataQuery(dataStoreQuery, {
        onError: function (params) {
            defineNamespaces()
        }
    });


    const [mutate] = useDataMutation(dataStoreMutation)
    const [settingMutate] = useDataMutation(dataStoreMutationSettings)
    const defineNamespaces = async () => {
        await mutate()
        await settingMutate()
        console.log('CREATED')
    }


    if (error) {
        return <span>ERROR: {JSON.stringify(error.details)}</span>;
    }

    if (loading) {
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }


    return (
        <div>
            <div className={styles.cardWrapper}>
                <Card>
                    <div>
                        <h4 style={{ margin: "15px" }}>Users</h4>
                        <hr />
                    </div>
                    <div style={{ padding: "15px" }}>
                        List of system users, with the possibility to update the password and disable
                    </div>
                    <div style={{ padding: "15px" }}>
                        <Link to="/users" style={{ textDecoration: 'none', marginRight: "0px", right: 0 }}>
                            <Button>
                                List
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
            <div className={styles.cardWrapper}>
                <Card>
                    <div>
                        <h4 style={{ margin: "15px" }}>Roles</h4>
                        <hr />
                    </div>
                    <div style={{ padding: "15px" }}>
                        Roles is the grouping of user roles so you can manage users based on their roles
                    </div>
                    <div style={{ padding: "15px" }}>
                        <Link to="/roles/create" style={{ textDecoration: 'none', marginRight: "6px" }}>
                            <Button primary>
                                Create
                            </Button>
                        </Link>
                        <Link to="/roles/list" style={{ textDecoration: 'none' }}>
                            <Button>
                                List
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    )
}