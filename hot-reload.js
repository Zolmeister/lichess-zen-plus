const filesInDirectory = dir => new Promise (resolve =>

    dir.createReader ().readEntries (entries =>

        Promise.all (entries.filter (e => e.name[0] !== '.').map (e =>

            e.isDirectory
                ? filesInDirectory (e)
                : new Promise (resolve => e.file (resolve))
        ))
        .then (files => [].concat (...files))
        .then (resolve)
    )
)

const timestampForFilesInDirectory = dir =>
        filesInDirectory (dir).then (files =>
            files.map (f => f.name + f.lastModifiedDate).join ())

console.log('loading');
chrome.tabs.query ({ url: '*://www.bridgebase.com/*' }, tabs => { // NB: see https://github.com/xpl/crx-hotreload/issues/5
  console.log('injecting', tabs.length);
  tabs.map(tab => {
    console.log('???');
    chrome.tabs.insertCSS(tab.id, {file: 'theme.css'}, function() {
      console.log('executed');
    })
  })
})

const reload = () => {
  console.log('reload');
  chrome.runtime.reload()
}

const watchChanges = (dir, lastTimestamp) => {

    timestampForFilesInDirectory (dir).then (timestamp => {

        if (!lastTimestamp || (lastTimestamp === timestamp)) {

            setTimeout (() => watchChanges (dir, timestamp), 1000) // retry after 1s

        } else {

            reload ()
        }
    })

}

chrome.management.getSelf (self => {

    if (self.installType === 'development') {

        chrome.runtime.getPackageDirectoryEntry (dir => watchChanges (dir))
    }
})
