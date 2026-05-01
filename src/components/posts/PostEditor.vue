<script setup>
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import SUNEDITOR, { plugins } from "suneditor";
import "suneditor/css/editor";
import "suneditor/css/contents";
import uk from "suneditor/langs/uk";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/htmlmixed/htmlmixed";
import katex from "katex"
import "katex/dist/katex.min.css"


const props = defineProps({
  modelValue: { type: String, default: "" },
  options: { type: Object, default: () => ({}) }
});

let dataHTML = ''

const emit = defineEmits(["update:modelValue"]);

const el = ref(null);
let instance = null;

onMounted(() => {
  //console.log('Start data: ',props.modelValue)
  instance = SUNEDITOR.create(el.value, {
    plugins,
    lang: uk,
    ...props.options,

    externalLibs: {
      codeMirror: { src: CodeMirror },
      katex: { src: katex },
    },

    template: {
      items: [{"name":"Greeting","html":"<p>Hello!</p>"}],
    },
    layout: {
      items: [{"name":"Two Column","html":"<div style=\"display:flex;gap:1em\"><div style=\"flex:1\">Left</div><div style=\"flex:1\">Right</div></div>"}],
    },
    imageGallery: {
      url: "/api/gallery/image",
    },
    videoGallery: {
      url: "/api/gallery/video",
    },
    audioGallery: {
      url: "/api/gallery/audio",
    },
    fileGallery: {
      url: "/api/gallery/file",
    },
    fileBrowser: {
      url: "/api/gallery/browse",
    },
    image: {
      uploadUrl: "/api/upload/post-image",
    },
    video: {
      uploadUrl: "/api/upload",
    },
    audio: {
      uploadUrl: "/api/upload",
    },
    embed: {
      uploadUrl: "/api/upload",
    },
    link: {
      uploadUrl: "/api/upload",
    },
    exportPDF: {
      apiUrl: "/api/download/pdf",
    },
    fileUpload: {
      uploadUrl: "/api/upload",
    },

    buttonList: [
              ["save", "preview"],
               "|",
              ["undo", "redo"],
              "|",
              ["blockStyle", "font", "fontSize"],
              "|",
              ["bold", "italic", "underline", "strike", "subscript", "superscript"],
              "|",
              ["fontColor", "backgroundColor"],
              "|",
              ["removeFormat", "copyFormat", "textStyle"],
              "/",
              ["blockquote", "paragraphStyle", "|", "align", "list_numbered", "list_bulleted", "|", "outdent", "indent", "lineHeight"],
              ["table", "link", "image"],
              [":Insert-default.more_plus", "hr", "anchor", "math", "|", "template", "layout"],
              [":Media-default.more_media", "drawing", "video", "audio", "embed", "fileUpload"],
              [":Gallery-default.more_gallery", "imageGallery", "videoGallery", "audioGallery", "fileGallery", "fileBrowser"],
              "|",
              ["fullScreen", "showBlocks", "codeBlock", "codeView", "markdownView"],
              [":More-default.more_view", "newDocument", "selectAll", "save", "copy", "|", "preview", "print", "exportPDF", "|"],
              [
                "%992",
                [
                   ["save", "preview"],
               "|",
                ["undo", "redo"],
                "|",
                [":Format-default.more_paragraph", "blockStyle", "font", "fontSize"],
                ["bold", "italic", "underline", "strike", "subscript", "superscript"],
                [":Text-default.more_text", "fontColor", "backgroundColor", "|", "removeFormat", "copyFormat", "textStyle"],
                [":Paragraph-default.more_list", "blockquote", "paragraphStyle", "|", "align", "list_numbered", "list_bulleted", "|", "outdent", "indent", "lineHeight"],
                ["table", "link", "image"],
                [":Insert-default.more_plus", "hr", "anchor", "math", "|", "template", "layout"],
                [":Media-default.more_media", "drawing", "video", "audio", "embed", "fileUpload"],
                [":Gallery-default.more_gallery", "imageGallery", "videoGallery", "audioGallery", "fileGallery", "fileBrowser"],
                "|",
                ["fullScreen", "showBlocks"],
                [":More-default.more_view", "codeBlock", "codeView", "markdownView", "|", "newDocument", "selectAll", "save", "copy", "|", "preview", "print", "exportPDF", "|"]
                ]
              ],
              [
                "%768",
                [
                   ["save", "preview"],
               "|",
                ["undo", "redo"],
                "|",
                [":Format-default.more_paragraph", "blockStyle", "font", "fontSize"],
                ["bold", "italic", "underline", "strike"],
                "|",
                ["fontColor", "backgroundColor"],
                [":Text-default.more_text", "removeFormat", "|", "subscript", "superscript", "|", "copyFormat", "textStyle"],
                [":Paragraph-default.more_list", "blockquote", "paragraphStyle", "|", "align", "list_numbered", "list_bulleted", "|", "outdent", "indent", "lineHeight"],
                [":Insert-default.more_plus", "table", "hr", "link", "anchor", "math", "|", "template", "layout"],
                [":Media-default.more_media", "image", "drawing", "video", "audio", "embed", "fileUpload", "|", "imageGallery", "videoGallery", "audioGallery", "fileGallery", "fileBrowser"],
                ["-right", ":View-default.more_view", "fullScreen", "showBlocks", "codeBlock", "codeView", "markdownView", "|"],
                ["-right", ":Docs-default.more_horizontal", "newDocument", "selectAll", "save", "copy", "preview", "print", "exportPDF"]
                ]
              ],
              [
                "%576",
                [
                   ["save", "preview"],
               "|",
                ["undo", "redo"],
                "|",
                [":Format-default.more_paragraph", "blockStyle", "font", "fontSize", "|", "blockquote", "paragraphStyle"],
                [":Text-default.more_text", "bold", "italic", "underline", "strike", "subscript", "superscript", "|", "fontColor", "backgroundColor", "|", "removeFormat", "copyFormat", "textStyle"],
                [":Paragraph-default.more_list", "align", "list_numbered", "list_bulleted", "|", "outdent", "indent", "lineHeight"],
                [":Insert-default.more_plus", "table", "hr", "link", "anchor", "math", "|", "template", "layout"],
                [":Media-default.more_media", "image", "drawing", "video", "audio", "embed", "fileUpload", "|", "imageGallery", "videoGallery", "audioGallery", "fileGallery", "fileBrowser"],
                ["-right", ":More-default.more_view", "fullScreen", "showBlocks", "codeBlock", "codeView", "markdownView", "|", "|", "newDocument", "selectAll", "save", "copy", "preview", "print", "exportPDF"]
                ]
              ]
            ],

    events: {
      onChange: (contents) => {          // ← вот так правильно
        //console.log('SunEditor change:', contents);
        //emit("update:modelValue", contents.data);
        //dataHTML=contents.data
      },
      onSave: (contents) => {          // ← вот так правильно
        console.log('Save', contents);
        emit("update:modelValue", contents.data);
        //dataHTML=contents.data
      }
    }
  });
});

watch(
  () => props.modelValue,
  (val) => {  
    if (instance && val !== instance.getContents?.()) {
      instance.$.html.set(props.modelValue || '');
    }
  }
)

onBeforeUnmount(() => {
  if (!instance) return

  const ed = instance
  instance = null

  nextTick(() => {
    try {
      if (ed.core?.context?.codeView?.isCodeView) {
        ed.core.toggleCodeView()
      }

      ed.destroy()
    } catch (e) {
      console.warn('SunEditor destroy safe:', e)
    }
  })
})
</script>

<template>
  <textarea ref="el" />
</template>