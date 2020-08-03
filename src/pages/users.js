import React, { useState } from 'react'
import {
    Table, TableHead, TableRowHead, TableCellHead,
    TableBody, TableRow, TableCell, CircularLoader, CenteredContent,
    FlyoutMenu, MenuItem, DropdownButton, Modal, ModalContent,
    ModalActions, ModalTitle, ButtonStrip, Button, AlertBar, TableFoot, Checkbox, SingleSelect, SingleSelectOption
} from '@dhis2/ui'
import { useDataQuery, useDataMutation } from '@dhis2/app-runtime'
import styles from './Form.module.css'


let currentPageData = [];
let totalPages = 1;
let pageSize = 5;
let checkboxALL = false;
let currentUser = {};
let userList = [];
let action = null;
let modalMessage = null;

const backColor = {
    backgroundColor: "#EED5D2 !important"
}


const usersQuery = {
    results: {
        resource: "users",
        params: {
            paging: false,
            fields: ["*"],
        }
    },
    dataStoreSettings: {
        resource: "dataStore/userMan/settings"
    },
    dataStoreRoles: {
        resource: "dataStore/userMan/userRoles"
    }

}


const usersMutation = {
    resource: 'users',
    id: ({ id }) => id,
    type: 'update',
    data: ({ user }) => user
}

const usersMetadataMutation = {
    resource: 'metadata',
    type: 'create',
    data: ({ users }) => users
}



export const Users = () => {

    const [visible, setVisible] = useState(false)
    const [alertVisible, setAlertVisible] = useState(false)
    const [page, setPage] = useState(1)
    const [checked, setChecked] = useState([])
    const [selected, setSelected] = useState("-1")


    const showModal = (user, typeAction) => {
        action = typeAction;
        currentUser = user;

        if (typeAction == "RESET") {
            modalMessage = user !== null ? "Are you sure you want to reset password for: " + user?.displayName : "Are you sure you want to reset password for the selected users";
        } else {
            modalMessage = user !== null ? "Are you sure you want to " + typeAction.toLowerCase() + ": " + user?.displayName : "Are you sure you want to " + typeAction.toLowerCase() + " the selected users"
        }

        setAlertVisible(false)
        setVisible(true)
    }

    const showAlert = () => {
        setAlertVisible(true)
    }

    const hideModal = () => {
        currentUser = {}
        setVisible(false)
    }

    const alertBar = () => {

        if (alertVisible) {
            return (
                <CenteredContent
                    position="bottom"
                >
                    <div
                        className="alert-bars"
                    >
                        <AlertBar
                            dataTest="dhis2-uicore-alertbar"
                            duration={4000}
                            icon
                            success
                        >
                            Success
                    </AlertBar>
                    </div>
                </CenteredContent>
            )
        }
    }

    const moreOptions = (user) => {
        let menu = null;
        if (user.userCredentials.disabled) {
            menu = (
                <MenuItem
                    dataTest="dhis2-uicore-menuitem"
                    label="Enable"
                    onClick={(value) => showModal(user, "ENABLE")}
                />
            );
        } else {
            menu = (
                <MenuItem
                    dataTest="dhis2-uicore-menuitem"
                    label="Disable"
                    onClick={(value) => showModal(user, "DISABLE")}
                />
            );
        }
        return (
            <FlyoutMenu
                dataTest="dhis2-uicore-menu"
                dense
                maxHeight="auto"
                maxWidth="380px"
            >
                <MenuItem
                    dataTest="dhis2-uicore-menuitem"
                    label="Reset Password"
                    onClick={(value) => showModal(user, "RESET")}
                />
                {menu}

            </FlyoutMenu>
        )
    }

    const [mutate, { error }] = useDataMutation(usersMutation)
    const [mutateUserMetadata] = useDataMutation(usersMetadataMutation)

    const resetUserPass = async (user) => {
        setVisible(false)
        console.log("resseting pass");
        if (user !== null) {
            // console.log("single")
            user.userCredentials.password = data.dataStoreSettings.settings.defaultPassword;
            await mutate({
                id: user.id,
                user: user
            });
        } else {
            // console.log("multi")
            let users = {
                users: []
            }
            for (let userId of checked) {
                for (let userData of data.results.users) {
                    if (userId == userData.id) {
                        userData.userCredentials.password = data.dataStoreSettings.settings.defaultPassword;
                        users.users.push(userData)
                    }
                }
            }
            await mutateUserMetadata({
                users: users
            })
        }
        showAlert()
    }

    const disableEnableUser = async (user) => {
        setVisible(false)
        // console.log("resseting", user, type);
        let disable = false;
        if (action == "DISABLE") {
            disable = true;
        } else {
            disable = false
        }
        if (user !== null) {
            // console.log("single")
            user.userCredentials.disabled = disable
            await mutate({
                id: user.id,
                user: user
            });
        } else {
            // console.log("multi")
            let users = {
                users: []
            }
            for (let userId of checked) {
                for (let userData of data.results.users) {
                    if (userId == userData.id) {
                        userData.userCredentials.disabled = disable;
                        users.users.push(userData)
                    }
                }
            }
            await mutateUserMetadata({
                users: users
            })
        }
        showAlert()
    }

    const setTotalPages = () => {
        let remainder = userList.length % pageSize
        if (remainder == 0) {
            totalPages = userList.length / pageSize
        } else {
            totalPages = parseInt(userList.length / pageSize)
            totalPages++
        }
    }

    const setPageData = () => {
        currentPageData = [];
        let index = (page - 1) * pageSize
        let limit = pageSize * page
        // console.log(index, limit)
        if (limit <= userList.length) {
            for (let i = index; i < limit; i++) {
                currentPageData.push(userList[i])
            }
        } else {
            for (let i = index; i < userList.length; i++) {
                currentPageData.push(userList[i])
            }
        }
    }

    const onNext = () => {
        setPage(page + 1)
    }

    const onPrev = () => {
        setPage(page - 1)
    }

    const handleCheckAllClick = (value) => {
        checkboxALL = value.checked
        if (value.checked) {
            let newCheckeds = userList.map((n) => n.id);
            setChecked(newCheckeds);
            return;
        }
        setChecked([]);
    }

    const handleCheckBox = (value) => {
        let checkedIndex = checked.indexOf(value.name)
        let newChecked = [];

        if (checkedIndex === -1) {
            newChecked = newChecked.concat(checked, value.name);
        } else if (checkedIndex === 0) {
            newChecked = newChecked.concat(checked.slice(1));
        } else if (checkedIndex === checked.length - 1) {
            newChecked = newChecked.concat(checked.slice(0, -1));
        } else if (checkedIndex > 0) {
            newChecked = newChecked.concat(
                checked.slice(0, checkedIndex),
                checked.slice(checkedIndex + 1),
            );
        }
        console.log(newChecked)
        checkboxALL = newChecked.length === userList.length ? true : false
        setChecked(newChecked)

    }
    const isSelected = (name) => checked.indexOf(name) !== -1;

    const handleSelectOption = (value) => {
        // console.log("selected", value)
        filterUsers(value.selected)
        setSelected(value.selected)
    }

    const filterUsers = (mainRole) => {
        if (mainRole != "-1") {
            userList = [];
            let userRole = null;
            for (let urole of data.dataStoreRoles.userRoles) {
                if (mainRole == urole.id) {
                    userRole = urole;
                    break
                }
            }
            for (let role of userRole.roles) {
                for (let user of data.results.users) {
                    let cont = 0;
                    for (let uRole of user.userCredentials.userRoles) {
                        if (role.id == uRole.id) {
                            cont++;
                        }
                    }
                    if (cont == userRole.roles.length) {
                        userList.push(user);
                    }
                }
            }
        } else {
            userList = data.results.users
        }

    }

    const { loading, data } = useDataQuery(usersQuery, {
        onComplete: function (params) {
            userList = params.results.users
        }
    })

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

    setTotalPages()
    setPageData()

    return (
        <div>
            <div style={{ minWidth: "150px", width: "500px" }}>
                <span style={{ marginTop: "10px", float: "left" }}>Filter By Roles: </span>
                <div style={{ minWidth: "150px", width: "270px" }}>
                    <SingleSelect
                        className="select"
                        dataTest="dhis2-uicore-singleselect"
                        selected={selected}
                        onChange={(value) => handleSelectOption(value)}
                    >
                        <SingleSelectOption
                            dataTest="dhis2-uicore-singleselectoption"
                            label="ALL"
                            value="-1"
                        />
                        {data.dataStoreRoles.userRoles.map((role, index) =>
                            <SingleSelectOption
                                dataTest="dhis2-uicore-singleselectoption"
                                label={role.name}
                                value={role.id}
                            />
                        )}
                    </SingleSelect>
                </div>
            </div>
            <Table dataTest="dhis2-uicore-table">
                <TableHead dataTest="dhis2-uicore-tablehead">
                    <TableRowHead dataTest="dhis2-uicore-tablerowhead">
                        <TableCellHead dataTest="dhis2-uicore-tablecellhead">
                            <Checkbox
                                dataTest="dhis2-uicore-checkbox"
                                checked={checkboxALL}
                                name="ALL"
                                onChange={(value) => handleCheckAllClick(value)}
                            />
                        </TableCellHead>
                        <TableCellHead dataTest="dhis2-uicore-tablecellhead">
                            Full Name
                        </TableCellHead>
                        <TableCellHead dataTest="dhis2-uicore-tablecellhead">
                            User
                        </TableCellHead>
                        <TableCellHead dataTest="dhis2-uicore-tablecellhead">
                            Created
                        </TableCellHead>
                        <TableCellHead dataTest="dhis2-uicore-tablecellhead">
                            Last updated
                        </TableCellHead>
                        <TableCellHead dataTest="dhis2-uicore-tablecellhead">
                            Disabled
                        </TableCellHead>
                        <TableCellHead dataTest="dhis2-uicore-tablecellhead">
                        </TableCellHead>
                    </TableRowHead>
                </TableHead>
                <TableBody dataTest="dhis2-uicore-tablebody">
                    {currentPageData.map((user, index) => {
                        let isChecked = isSelected(user.id);
                        let created = user.created.split("T")
                        let lastUpdated = user.lastUpdated.split("T")
                        return (
                            <TableRow dataTest="dhis2-uicore-tablerow">
                                <TableCell dataTest="dhis2-uicore-tablecell">
                                    <Checkbox
                                        dataTest="dhis2-uicore-checkbox"
                                        checked={isChecked}
                                        name={user.id}
                                        onChange={(value) => handleCheckBox(value)}
                                    />
                                </TableCell>
                                <TableCell dataTest="dhis2-uicore-tablecell">
                                    {user.displayName}
                                </TableCell>
                                <TableCell dataTest="dhis2-uicore-tablecell">
                                    {user.userCredentials.username}
                                </TableCell>
                                <TableCell dataTest="dhis2-uicore-tablecell">
                                    {created[0]}
                                </TableCell>
                                <TableCell dataTest="dhis2-uicore-tablecell">
                                    {lastUpdated[0]}
                                </TableCell>
                                <TableCell dataTest="dhis2-uicore-tablecell">
                                    {user.userCredentials.disabled ? "YES" : "NO"}
                                </TableCell>
                                <TableCell dataTest="dhis2-uicore-tablecell">
                                    <DropdownButton
                                        component={moreOptions(user)}
                                        dataTest="dhis2-uicore-dropdownbutton"
                                    >
                                    </DropdownButton>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
                <TableFoot dataTest="dhis2-uicore-tablefoot">
                    <TableRow dataTest="dhis2-uicore-tablerow">
                        <TableCell
                            colSpan="8"
                            dataTest="dhis2-uicore-tablecell"
                        >
                            <ButtonStrip
                                end
                            >
                                {checked.length > 0 && (
                                    <div>
                                        <Button primary onClick={() => showModal(null, "RESET")}>
                                            Reset Password
                                        </Button>
                                        <Button danger onClick={() => showModal(null, "ENABLE")}>
                                            Enable
                                        </Button>
                                        <Button danger onClick={() => showModal(null, "DISABLE")}>
                                            Disable
                                        </Button>
                                    </div>
                                )}

                                {/* <Button disabled={page === 1}>
                                    First
                                </Button> */}
                                <Button onClick={onPrev} disabled={page === 1}>
                                    Previous
                                </Button>
                                <span style={{ margin: "10px" }}>
                                    Page {page} of {totalPages}
                                </span>
                                <Button onClick={onNext} disabled={page === totalPages}>
                                    Next
                                </Button>
                                {/* <Button
                                    disabled={page === 1}
                                >
                                    Last
                                </Button> */}
                            </ButtonStrip>
                        </TableCell>
                    </TableRow>
                </TableFoot>
            </Table>
            {visible && (
                <Modal>
                    <ModalTitle>Attention</ModalTitle>
                    <ModalContent>
                        {modalMessage}
                    </ModalContent>
                    <ModalActions>
                        <ButtonStrip
                            end
                        >
                            <Button onClick={() => hideModal()}>No</Button>
                            {action === "RESET" ? <Button primary onClick={() => resetUserPass(currentUser)}>Yes</Button>
                                : <Button primary onClick={() => disableEnableUser(currentUser)}>Yes</Button>}
                        </ButtonStrip>
                    </ModalActions>
                </Modal>
            )}
            {alertBar()}
        </div>
    )
};