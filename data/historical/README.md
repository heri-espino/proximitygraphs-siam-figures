# Historical data: John Snow's Soho cholera map

**Historical map:** John Snow, *On the Mode of Communication of Cholera* (1855, second edition), depicting the 1854 Soho cholera outbreak.

**Coordinates:** the \`HistData\` package's digitization, mirrored by Rdatasets. The files in this folder are verbatim copies of the CSV tables, preserved for independent replication:

- \`Snow.pumps.csv\`: **13 pump locations**, including historical labels such as **Broad St**.
- \`Snow.deaths.csv\`: **578 individual death-location marks**, including intentional visual stacking where multiple people shared an address.

Primary data documentation and original CSVs:
- [HistData Snow.pumps documentation](https://vincentarelbundock.github.io/Rdatasets/doc/HistData/Snow.pumps.html)
- [HistData Snow.deaths documentation](https://vincentarelbundock.github.io/Rdatasets/doc/HistData/Snow.deaths.html)
- [Raw Rdatasets pump CSV](https://raw.githubusercontent.com/vincentarelbundock/Rdatasets/master/csv/HistData/Snow.pumps.csv)
- [Raw Rdatasets death CSV](https://raw.githubusercontent.com/vincentarelbundock/Rdatasets/master/csv/HistData/Snow.deaths.csv)
- [HistData R package](https://cran.r-project.org/package=HistData)
- [Robin Wilson's map digitization project](https://johnsnow.rtwilson.com/)

## Aspect-preserving normalization

For all 13 pump and 578 death coordinates together, compute componentwise minima \(m_j\) and maxima \(M_j\), and apply one uniform scale:

\[
s=\frac{0.84}{\max(M_x-m_x,M_y-m_y)},\qquad
b_j=\frac{1-s(M_j-m_j)}2,\qquad
\widehat x_j=b_j+s(x_j-m_j).
\]

Both layers are therefore plotted in the same normalized coordinate system, preserving distances up to a common factor. These are digitized positions on a historical map, **not modern geographic coordinates, GPS locations, or measured street distances**.

## Scientific and editorial interpretation

The 13 pumps are **editable Voronoi sites**; the 578 death records are **read-only contextual marks**. Broad Street is highlighted initially. Changes to the pump set are counterfactual examples, not changes to the historical record. The Euclidean Voronoi/Delaunay analysis is a modern teaching overlay, not John Snow's own analytical procedure. It is not a causal analysis and does not establish individual pump use or disease transmission.

Preserve the original CSVs unchanged. For broader redistributions, credit the HistData package and digitizers and confirm the package/data redistribution terms. The synthetic smiley and sensor examples have separate, fully deterministic coordinates within \`scripts/export_scenes.py\`.
