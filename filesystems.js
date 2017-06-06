// download function from
// https://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
var downloadFile;
var setupFileSelect;


(function(){
	function downloadFile(filename, text) {
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		element.setAttribute('download', filename);

		element.style.display = 'none';
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	}

	function setupFileSelect(elementname, func) {
		document.getElementById(elementname).addEventListener("change", func, false);
	}


	function handleFileSelect(evt) {
		var files = evt.target.files; // FileList object

		// files is a FileList of File objects. List some properties.
		var output = [];
		for (var i = 0, f; f = files[i]; i++) {

		}
	}

 //document.getElementById('files').addEventListener('change', handleFileSelect, false);

});
