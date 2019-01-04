import { Web } from "../../ddevlib/js/Web.js";

export async function getIconList()
{
    const commaSepparatedList = await Web.get("/ddevlib/icons/icon.txt", "TEXT");

    if (commaSepparatedList)
    {
        const list = commaSepparatedList.split("\n");

        for (const icon of list)
            icon.trim();

        list.sort();
        
        return list;
    }

    throw new Error("Failed to find icon list");
}