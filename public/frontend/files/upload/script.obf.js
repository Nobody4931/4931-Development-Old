// why hello there :0
$(document).ready(() => {
	//#region thumbnail_stuff
	var CanGenerate = true;
	var Generated = 0;
	var Content = document.getElementById("content");

	var Generate = function() {
		if (CanGenerate != true) return;

		fetch("./", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				method: "query_files",
				start: Generated,
				limit: 50
			})
		}).then(async (Response) => {
			var Data = await Response.json();
			if (Data.success == false) return Generate();
			if (Data.data == null) return Generate();

			Data.data.forEach((File) => {
				Content.innerHTML += `
				<span>
					<a href="${File.link}" target="_blank">
						<img src="${File.thumbnail}" alt="${File.identifier}">
					</a>
					${File.deletable == true ? `<a class="enabled">delete image</a>` : `<a class="disabled">unable to delete image</a>`}
				</span>`;
			});

			CanGenerate = true;
		}).catch(() => CanGenerate = true);
	}

	window.onscroll = (Event) =>
		(window.innerHeight + window.scrollY >= document.body.offsetHeight) ?
			Generate() : null;

	Generate();
	//#endregion thumbnail_stuff

	//#region upload_stuff
	var UplStatus = document.getElementById("upload-status");
	var FileInput = document.getElementById("input-file");

	var FileLabel = document.getElementById("label-file");
	var OrigValue = FileLabel.innerHTML;

	FileInput.addEventListener("change", (Event) => {
		/* maybe some other day ¯\_(ツ)_/¯
		var FileName = Event.target.value.split("\\").pop();
		(FileName != null && FileName != "") ?
			FileLabel.innerHTML = FileName :
			FileLabel.innerHTML = OrigValue;
		*/

		var File = FileInput.files[0];
		if (File == null) return;

		var Form = new FormData();
		Form.append("uploaded_file", File);
		
		fetch("./", {
			method: "PUT",
			body: Form
		}).then(async (Response) => {
			var Data = await Response.json();
			console.log(Data);
		}).catch(() => {});
	});
	//#endregion upload_stuff
});