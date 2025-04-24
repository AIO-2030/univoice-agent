let upstream = https://github.com/dfinity/vessel-package-set/releases/download/mo-0.10.0-20231113/package-set.dhall sha256:bb887f2f87f70a807f5b9a1bad9da6cff8b6ba2eba33d42a3029f48427da8a28
let Package =
    { name : Text, version : Text, repo : Text, dependencies : List Text }

let additions = [
  { name = "vector"
  , repo = "https://github.com/ImperiumXyz/vector.mo"
  , version = "v0.2.0"
  , dependencies = ["base"]
  },
  { name = "cert"
  , repo = "https://github.com/nomeata/ic-certification"
  , version = "v0.1.3"
  , dependencies = ["base"]
  },
  { name = "icrc7-mo"
  , repo = "https://github.com/PanIndustrial-Org/icrc7.mo"
  , version = "v0.5.0"
  , dependencies = ["base"]
  },
  { name = "icrc37-mo"
  , repo = "https://github.com/PanIndustrial-Org/icrc37.mo"
  , version = "v0.5.1"
  , dependencies = ["base", "icrc7-mo"]
  },
  { name = "icrc3-mo"
  , repo = "https://github.com/PanIndustrial-Org/icrc3.mo"
  , version = "v0.2.4"
  , dependencies = ["base"]
  },
  { name = "class-plus"
  , repo = "https://github.com/PanIndustrial-Org/class-plus.mo"
  , version = "v0.0.1"
  , dependencies = ["base"]
  }
] : List Package

let
  -- This is where you can add your own packages to the package-set
  additions =
    additions

let
  {- This is where you can override existing packages in the package-set

     For example, if you wanted to use version `v2.0.0` of the foo library:
     let overrides = [
         { name = "foo"
         , version = "v2.0.0"
         , repo = "https://github.com/bar/foo"
         , dependencies = [] : List Text
         }
     ]
  -}
  overrides =
    [] : List Package

in  upstream # additions # overrides
