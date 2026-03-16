import React from 'react'
import '../../../../../cssQuill.css'

export default function DynamicTitle({ formik, field, name }) {
    return (<div dangerouslySetInnerHTML={{ __html: field.value }} />)
}
