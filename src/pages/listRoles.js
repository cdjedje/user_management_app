import React, { useState } from 'react'
import { Link, Redirect } from 'react-router-dom';
import {
    Table, TableHead, TableRowHead, TableCellHead,
    TableBody, TableRow, TableCell, CircularLoader, CenteredContent,
    FlyoutMenu, MenuItem, DropdownButton, TableFoot, Button, ButtonStrip,
    Modal, ModalTitle, ModalContent, ModalActions
} from '@dhis2/ui'
import { useDataQuery, useDataMutation } from '@dhis2/app-runtime'


let currentRole = null

const dataStoreQuery = {
    results: {
        resource: "dataStore/userMan/userRoles"
    },
    users: {
        resource: "users",
        params: {
            paging: false,
            fields: ["id, displayName"]
        }
    }
}

const dataStoreMutation = {
    resource: 'dataStore/userMan/userRoles',
    type: 'update',
    data: ({ userRoles }) => ({
        userRoles,
    })
}


export const ListRoles = () => {


    const [visible, setVisible] = useState(false)
    const [redirect, setRedirect] = useState(false)

    const [mutate] = useDataMutation(dataStoreMutation)

    const moreOptions = (role) => {
        return (
            <FlyoutMenu
                dataTest="dhis2-uicore-menu"
                dense
                maxHeight="auto"
                maxWidth="380px"
            >
                <MenuItem
                    dataTest="dhis2-uicore-menuitem"
                    label="Edit"
                    onClick={() => redirectToEdit(role)}
                />
                <MenuItem
                    dataTest="dhis2-uicore-menuitem"
                    label="Delete"
                    onClick={(value) => showModal(role)}
                />
            </FlyoutMenu>
        )
    }

    const redirectToEdit = (role) => {
        currentRole = role;
        setRedirect(true)
    }

    const showModal = (role) => {
        currentRole = role;
        setVisible(true)
    }

    const hideModal = () => {
        currentRole = null
        setVisible(false)
    }

    const deleteRole = async () => {
        setVisible(false)
        console.log(currentRole)
        let index = data.results.userRoles.map(function (role) { return role.id }).indexOf(currentRole.id)
        data.results.userRoles.splice(index, 1)
        console.log(data.results.userRoles)

        await mutate({
            userRoles: data.results.userRoles
        })
    }

    const getUser = (role) => {
        for (let user of data.users.users) {
            if (role.createdBy == user.id) {
                return user
            }
        }
        return null
    }

    const { loading, data, error } = useDataQuery(dataStoreQuery)


    if (error) {
        return <span>ERROR: {error.message}</span>;
    }

    if (loading) {
        return (
            <CenteredContent>
                <CircularLoader />
            </CenteredContent>
        )
    }

    if (redirect) {
        return <Redirect to={{ pathname: "/roles/edit/" + currentRole.id }} />
    }

    return (
        <div>
            <Table dataTest="dhis2-uicore-table">
                <TableHead dataTest="dhis2-uicore-tablehead">
                    <TableRowHead dataTest="dhis2-uicore-tablerowhead">
                        <TableCellHead dataTest="dhis2-uicore-tablecellhead">
                            Name
                        </TableCellHead>
                        <TableCellHead dataTest="dhis2-uicore-tablecellhead">
                            Created At
                        </TableCellHead>
                        <TableCellHead dataTest="dhis2-uicore-tablecellhead">
                            Created By
                        </TableCellHead>
                        <TableCellHead dataTest="dhis2-uicore-tablecellhead">
                            Updated At
                        </TableCellHead>
                        <TableCellHead dataTest="dhis2-uicore-tablecellhead">
                        </TableCellHead>
                    </TableRowHead>
                </TableHead>
                <TableBody dataTest="dhis2-uicore-tablebody">
                    {data.results.userRoles.map((role, index) => {

                        let user = getUser(role)
                        return (
                            <TableRow dataTest="dhis2-uicore-tablerow">
                                <TableCell dataTest="dhis2-uicore-tablecell">
                                    {role.name}
                                </TableCell>
                                <TableCell dataTest="dhis2-uicore-tablecell">
                                    {role.created}
                                </TableCell>
                                <TableCell dataTest="dhis2-uicore-tablecell">
                                    {user.displayName}
                                </TableCell>
                                <TableCell dataTest="dhis2-uicore-tablecell">
                                    {role.updated}
                                </TableCell>
                                <TableCell dataTest="dhis2-uicore-tablecell">
                                    <DropdownButton
                                        component={moreOptions(role)}
                                        dataTest="dhis2-uicore-dropdownbutton"
                                    >
                                    </DropdownButton>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
                <TableFoot dataTest="dhis2-uicore-tablefoot">
                    <TableRow dataTest="dhis2-uicore-tablerow">
                        <TableCell
                            colSpan="8"
                            dataTest="dhis2-uicore-tablecell"
                        >
                            <ButtonStrip end>
                                <Link to="/roles/create" style={{ textDecoration: 'none' }}>
                                    <Button primary>
                                        Add New
                                    </Button>
                                </Link>
                            </ButtonStrip>

                        </TableCell>
                    </TableRow>
                </TableFoot>
            </Table>
            {visible && (
                <Modal>
                    <ModalTitle>Attention</ModalTitle>
                    <ModalContent>
                        Are you sure you want to delete this item?
                    </ModalContent>
                    <ModalActions>
                        <ButtonStrip
                            end
                        >
                            <Button onClick={() => hideModal()}>No</Button>
                            <Button primary onClick={() => deleteRole()}>Yes</Button>
                        </ButtonStrip>
                    </ModalActions>
                </Modal>
            )}
        </div>
    )
};