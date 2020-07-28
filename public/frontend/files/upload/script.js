$(document).ready(() => {
	//#region thumbnail_stuff
	var CanGenerate = true;
	var CanDelete = true;
	var CanUpload = true;

	var Generated = 0;
	var Content = document.getElementById("content");

	var Generate = function() {
		if (CanGenerate != true) return;
		CanGenerate = false;

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
				// Create entry
				var NewEntry = document.createElement("span");
				var ImageSRC = document.createElement("img");
				var ImageURL = document.createElement("a");
				var DelEntry = document.createElement("a");

				ImageSRC.setAttribute("alt", File.identifier);
				ImageSRC.setAttribute("src", File.thumbnail);

				ImageURL.setAttribute("target", "_blank");
				ImageURL.setAttribute("href", File.link);

				if (File.deletable == true) {
					DelEntry.classList.add("enabled");
					DelEntry.innerHTML = "delete image";
				} else {
					DelEntry.classList.add("disabled");
					DelEntry.innerHTML = "unable to delete image";
				}

				ImageURL.append(ImageSRC);
				NewEntry.append(ImageURL);
				NewEntry.append(DelEntry);
				Content.append(NewEntry);

				// Deletion handler
				if (File.deletable == true) {
					$(DelEntry).click((Event) => {
						if (CanDelete != true) return;
						CanDelete = false;

						fetch("./", {
							method: "DELETE",
							headers: {
								"Content-Type": "application/json"
							},
							body: JSON.stringify({
								identifier: File.identifier
							})
						}).then(async (Response2) => {
							var Data2 = await Response2.json();
							if (Data2.success != true) return CanDelete = true;

							CanGenerate = false;
							CanDelete = false;
							CanUpload = false;

							window.location.href = window.location.href;
						}).catch(() => CanDelete = true);
					});
				}
			});

			CanGenerate = true;
			Generated += Data.data.length;
		}).catch(() => CanGenerate = true);
	}

	Content.onscroll = (Event) =>
		($(Content).innerHeight() + $(Content).scrollTop() + 0.5 >= Content.scrollHeight) ?
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

		if (CanUpload == false) return;
		CanUpload = false;

		var File = FileInput.files[0];
		if (File == null) return;

		var Form = new FormData();
		Form.append("uploaded_file", File);

		
		fetch("./", {
			method: "PUT",
			body: Form
		}).then(async (Response) => {
			var Data = await Response.json();
			if (Data.success == true) {
				CanGenerate = false;
				CanDelete = false;

				UplStatus.style.color = "#00ff00";
				UplStatus.innerHTML = "status: success";

				setTimeout(() => window.location.href = window.location.href, 500);
			} else {
				UplStatus.style.color = "#ff0000";
				switch (Data.error) {
					case "access_denied":
						UplStatus.innerHTML = "status: access denied (how are you even in the mainframe)";
						break;
					case "file_missing":
						UplStatus.innerHTML = "status: file missing, try again";
						break;
					case "file_size":
						UplStatus.innerHTML = "status: error - file size too big (16 mb max)";
						break;
					case "unsupported_file":
						UplStatus.innerHTML = "status: error - file type unsupported";
						break;
					case "internal_error":
						UplStatus.innerHTML = "status: error - we have no idea what happened, try again";
						break;
				}
			}
			CanUpload = true;
		}).catch(() => CanUpload = true);
	});
	//#endregion upload_stuff
});