export var Chart;
(function (Chart) {
    function table(data) {
        let header = "";
        for (const item of data)
            header += `<th>${item.name ? item.name : item.value}</th>`;
        header = `<thead>${header}</thead>`;
        let body = "";
        for (const item of data)
            body += `<td>${item.value}</td>`;
        body = `<tbody>${body}</tbody>`;
        const el = document.createElement("table");
        el.innerHTML = header + body;
        return el;
    }
    Chart.table = table;
})(Chart || (Chart = {}));
//# sourceMappingURL=Diagram.js.map