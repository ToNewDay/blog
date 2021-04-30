import React, { ReactElement, ReactChild } from 'react';
import { Link } from 'react-router-dom';

function DocLink(props: { children?: ReactChild, to: string, className?: string }): ReactElement {

    if (props.to==undefined || props.to == '' ) {
        return <span className={props.className} >{props.children}</span>;
    }

    if (props.to.indexOf("https://") != -1 || props.to.indexOf("http://") != -1) {
        return <a className={props.className} href={props.to} >{props.children}</a>;
    }

    if (props.to.indexOf(".html") == -1) {
        return <span className={props.className} >{props.children}</span>;
    }

    return <Link className={props.className} to={`/docs/${props.to}` }  >{props.children}</Link>
}
export default DocLink;
