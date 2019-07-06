import { HtmlResult } from "../Html.js";

export namespace Components.Meta
{
    
}

export namespace Components.Meta.Properties
{
    
}

export interface ComponentPropertyDescription
{
    
}

export interface ComponentDescription
{
    tag: string;
    render: () => HtmlResult;

    properties: [];
    methods: [];
}