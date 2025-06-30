## Building

```bash
git clone https://github.com/jams-zhou-james/TsinghuaCourseRegistrationSystemCode_Frontend.git
cd TsinghuaCourseRegistrationSystemCode_Frontend
yarn
yarn start # open in Electron
yarn web:dev # open in browser (recommended)
```

所有 `yarn` 命令可能都要等上几分钟。

## Code Structure

### src/Plugins

同文生成的 API 后端接口。 **应该会马上变成一个 submodule 方便及时和后端同步。**

### src/Pages

生成网页的代码。

### src/Components

一些预置的小部件，例如边栏、顶栏（待设计）。按照袁洋圣经，支持了非常自由的 configuration，具体参看 Configs。

### src/Layouts

一些预置的页面布局，例如边栏布局、背景布局。同样按照袁洋圣经 highly configurable。现在并没有应用到全部页面上，然后 Layouts 内部还有些问题（灰边等）。