# Upload

Upload component. It is a wrapper for the ant-design [Upload](https://ant.design/components/upload) component.

## Basic Usage

```ts
type UploadProps = Omit<AntdUploadProps, 'onChange'> & {
  onChange?: (fileList: UploadFile[]) => void;
  serviceErrorMessage?: string;
  value?: any;
  size?: string;
};
```

<code src="./demos/new-demos/basic.tsx"></code>

## Multiple

<code src="./demos/new-demos/multiple.tsx"></code>

## Read Pretty

```ts
type UploadReadPrettyProps = AntdUploadProps;
```

<code src="./demos/new-demos/read-pretty.tsx"></code>