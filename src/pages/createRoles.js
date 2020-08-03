import React, { useState, useEffect } from 'react'
import {
    Button,
    InputFieldFF,
    CenteredContent,
    CircularLoader,
    Transfer,
    ReactFinalForm,
    hasValue
} from '@dhis2/ui'
import { Link, Redirect, useParams } from 'react-router-dom'
import { useDataQuery, useDataMutation } from '@dhis2/app-runtime'
import styles from './Form.module.css'

const { Field } = ReactFinalForm;

let editRole = null;
let editRoleIndex = -1;

const dataQuery = {
    results: {
        resource: "userRoles",
        params: {
            paging: false,
            fields: ["id~rename(value)", "name~rename(label)"]
        }
    },
    me: {
        resource: "me",
        params: {
            fields: ["id"]
        }
    },
    roles: {
        resource: "dataStore/userMan/userRoles"
    }
}

const dataStoreMutation = {
    resource: 'dataStore/userMan/userRoles',
    type: 'update',
    data: ({ userRoles }) => ({
        userRoles,
    })
}

const makeid = () => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 12; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const today = () => {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let yyyy = today.getFullYear();

    return yyyy + '-' + mm + '-' + dd;
}


export const CreateRoles = () => {

    const [selected, setSelected] = useState([]);
    const [redirect, setRedirect] = useState(false)

    const { roleId } = useParams();

    const { loading, error, data } = useDataQuery(dataQuery, {
        onComplete: function (params) {
            if (roleId) {
                console.log("roleId", roleId)
                editRoleIndex = params.roles.userRoles.map(function (role) { return role.id }).indexOf(roleId)
                editRole = params.roles.userRoles[editRoleIndex]
                let selectedAux = editRole.roles.map((role) => role.id);
                // console.log(editRole, selectedAux)
                setSelected(selectedAux)
            }
        }
    });

    const [mutate] = useDataMutation(dataStoreMutation, {
        onError: function (params) {
            alert("An error occurred, please try again")
        }
    })

    const handleTransfer = (value) => {
        console.log(value)
        setSelected(value.selected)
    }

    const saveSettings = async values => {
        if (selected.length > 0) {
            if (roleId) {
                let roles = [];
                for (let id of selected) {
                    roles.push({ id: id })
                }
                data.roles.userRoles[editRoleIndex].name = values.name
                data.roles.userRoles[editRoleIndex].roles = roles
                data.roles.userRoles[editRoleIndex].updated = today()

                await mutate({
                    userRoles: data.roles.userRoles
                })
            } else {
                let userRole = {
                    id: makeid(),
                    name: values.name,
                    roles: [],
                    created: today(),
                    createdBy: data.me.id,
                    updated: today()
                }
                for (let id of selected) {
                    userRole.roles.push({ id: id })
                }
                data.roles.userRoles.push(userRole)
                await mutate({
                    userRoles: data.roles.userRoles
                })
            }
            // console.log("SAVED")
            setRedirect(true)
        } else {
            alert("Please select at least one role")
        }
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

    if (redirect) {
        return <Redirect to="/roles/list" />
    }

    return (
        <div>
            <h3>Roles</h3>
            <ReactFinalForm.Form onSubmit={saveSettings}>
                {({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <div className={styles.row}>
                            <Field
                                required
                                name="name"
                                label="Name"
                                component={InputFieldFF}
                                className={styles.surname}
                                defaultValue={roleId ? editRole.name : null}
                                validate={hasValue}
                            />
                        </div>

                        <div style={{ marginTop: "25px", marginBottom: "25px", backgroundColor: "#fff", width: "680px" }}>
                            <Transfer
                                dataTest="dhis2-uicore-transfer"
                                height="240px"
                                initialSearchTerm=""
                                maxSelections={Infinity}
                                onChange={(value) => handleTransfer(value)}
                                options={data.results.userRoles}
                                optionsWidth="320px"
                                selected={selected}
                                selectedWidth="320px"
                            />
                        </div>

                        <div className={styles.row}>

                            <Button primary type="submit">
                                Save
                                </Button>
                            <Link to="/roles/list" style={{ textDecoration: 'none', marginLeft: "12px" }}>
                                <Button>
                                    Cancel
                                    </Button>
                            </Link>
                        </div>
                    </form>
                )}
            </ReactFinalForm.Form>
        </div>
    )
}