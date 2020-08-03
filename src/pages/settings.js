import React, { useState } from 'react'
import {
    Button,
    InputFieldFF,
    SingleSelectFieldFF,
    SwitchFieldFF,
    composeValidators,
    createEqualTo,
    email,
    hasValue,
    CenteredContent,
    CircularLoader,
    ReactFinalForm
} from '@dhis2/ui'
import { useDataQuery, useDataMutation } from '@dhis2/app-runtime'
import styles from './Form.module.css'


const { Field } = ReactFinalForm;

const dataStoreQuery = {
    results: {
        resource: "dataStore/userMan/settings",
    }
}

const dataStoreMutation = {
    resource: 'dataStore/userMan/settings',
    type: 'update',
    data: ({ settings }) => ({
        settings,
    })
}


export const Settings = () => {

    const { loading, error, data } = useDataQuery(dataStoreQuery, {
        onError: function (params) {
            defineNamespaces()
        }
    });


    const [mutate] = useDataMutation(dataStoreMutation)

    const saveSettings = async values => {
        data.results.settings = values;
        mutate({
            settings: data.results.settings
        })
        console.log("SAVED", data)
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
            <h3>Settings</h3>
            <ReactFinalForm.Form onSubmit={saveSettings}>
                {({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <div className={styles.row}>
                            <Field
                                required
                                name="defaultPassword"
                                label="Default Password"
                                component={InputFieldFF}
                                className={styles.surname}
                            />
                        </div>

                        <div className={styles.row}>
                            <Button primary type="submit">
                                Save
                        </Button>
                        </div>
                    </form>
                )}
            </ReactFinalForm.Form>
        </div>
    )
}