export const Map = {
  name: "map",
  // 新しいdiv要素を作成し、そのidにMapオブジェクトの名前を設定します。
  create: function(){
    const ele = document.createElement('div');
    ele.id = this.name;
    return ele;
  },
  // 既存のMapオブジェクトが存在する場合は削除し、新しいMapオブジェクトをmain-screen要素に追加します。
  mount: function(mapEl: HTMLDivElement){
    const ele = document.getElementById(this.name);
    if(ele) {
      ele.remove();
    }
    const mainScreen = document.getElementById('main-screen');
    mainScreen?.appendChild(mapEl);
  }
} as const;